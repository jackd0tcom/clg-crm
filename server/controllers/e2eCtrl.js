import { Op } from "sequelize";
import {
  User,
  UserSettings,
  Person,
  Case,
  CasePerson,
  CaseAssignees,
  CasePracticeAreas,
  CaseTribunal,
  Invoice,
  Payment,
  TimeEntry,
  CustomCharge,
  Task,
  TaskAssignees,
  Comment,
  Notification,
  ActivityLog,
  ActivityReaders,
} from "../model.js";

const E2E_EMAIL = "e2e.billing@clauselaw.test";
const E2E_AUTH0_ID = "e2e|billing-user";
const E2E_CASE_TITLE = "E2E Billing Matter";
const E2E_CLIENT = {
  firstName: "E2eAda",
  lastName: "Client",
  email: "e2e.client@clauselaw.test",
};

const e2eSecret = () =>
  process.env.E2E_TEST_SECRET ||
  (process.env.NODE_ENV === "production" ? null : "clg-e2e-local");

export const requireE2eSecret = (req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(404).send("Not found");
  }

  const secret = e2eSecret();
  if (!secret || req.headers["x-e2e-secret"] !== secret) {
    return res.status(401).send("E2E session is not available");
  }

  next();
};

const serializeUser = (user) => ({
  userId: user.userId,
  username: user.username,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  role: user.role,
  profilePic: user.profilePic,
  isAllowed: user.isAllowed,
  rateId: user.rateId ?? null,
  auth0Id: user.auth0Id,
});

const orWhere = (clauses) => {
  const defined = clauses.filter(Boolean);
  if (!defined.length) return null;
  if (defined.length === 1) return defined[0];
  return { [Op.or]: defined };
};

export async function wipeE2eData() {
  const user = await User.findOne({ where: { email: E2E_EMAIL } });
  const person = await Person.findOne({ where: { email: E2E_CLIENT.email } });

  const cases = await Case.findAll({
    where: orWhere([
      user && { ownerId: user.userId },
      { title: E2E_CASE_TITLE },
    ]),
  });
  const caseIds = cases.map((cas) => cas.caseId);

  const invoices = await Invoice.findAll({
    where:
      orWhere([
        user && { userId: user.userId },
        caseIds.length && { caseId: { [Op.in]: caseIds } },
        person && { personId: person.personId },
      ]) ?? { invoiceId: { [Op.in]: [] } },
  });
  const invoiceIds = invoices.map((invoice) => invoice.invoiceId);

  const tasks = caseIds.length
    ? await Task.findAll({ where: { caseId: { [Op.in]: caseIds } } })
    : [];
  const taskIds = tasks.map((task) => task.taskId);

  const paymentWhere = orWhere([
    caseIds.length && { caseId: { [Op.in]: caseIds } },
    invoiceIds.length && { invoiceId: { [Op.in]: invoiceIds } },
    person && { personId: person.personId },
  ]);
  if (paymentWhere) {
    await Payment.destroy({ where: paymentWhere });
  }

  if (invoiceIds.length) {
    await CustomCharge.destroy({
      where: { invoiceId: { [Op.in]: invoiceIds } },
    });
  }
  if (caseIds.length) {
    await CustomCharge.destroy({ where: { caseId: { [Op.in]: caseIds } } });
  }

  const entryWhere = orWhere([
    caseIds.length && { caseId: { [Op.in]: caseIds } },
    taskIds.length && { taskId: { [Op.in]: taskIds } },
    invoiceIds.length && { invoiceId: { [Op.in]: invoiceIds } },
    user && { userId: user.userId },
  ]);
  if (entryWhere) {
    await TimeEntry.destroy({ where: entryWhere });
  }

  if (invoiceIds.length) {
    await Invoice.destroy({ where: { invoiceId: { [Op.in]: invoiceIds } } });
  }

  if (taskIds.length) {
    await TaskAssignees.destroy({ where: { taskId: { [Op.in]: taskIds } } });
    await Comment.destroy({ where: { taskId: { [Op.in]: taskIds } } });
    await Notification.destroy({
      where: { objectType: "task", objectId: { [Op.in]: taskIds } },
    });
    await ActivityLog.destroy({
      where: { objectType: "task", objectId: { [Op.in]: taskIds } },
    });
    await Task.destroy({ where: { taskId: { [Op.in]: taskIds } } });
  }

  if (caseIds.length) {
    await CasePerson.destroy({ where: { caseId: { [Op.in]: caseIds } } });
    await CaseAssignees.destroy({ where: { caseId: { [Op.in]: caseIds } } });
    await CasePracticeAreas.destroy({
      where: { caseId: { [Op.in]: caseIds } },
    });
    await CaseTribunal.destroy({ where: { caseId: { [Op.in]: caseIds } } });
    await Comment.destroy({ where: { caseId: { [Op.in]: caseIds } } });
    await Notification.destroy({
      where: { objectType: "case", objectId: { [Op.in]: caseIds } },
    });
    await ActivityLog.destroy({
      where: { objectType: "case", objectId: { [Op.in]: caseIds } },
    });
    await Case.update(
      { billableContact: null },
      { where: { caseId: { [Op.in]: caseIds } } },
    );
    await Case.destroy({ where: { caseId: { [Op.in]: caseIds } } });
  }

  if (person) {
    await CasePerson.destroy({ where: { personId: person.personId } });
    await ActivityLog.destroy({
      where: { objectType: "person", objectId: person.personId },
    });
    await person.destroy();
  }

  if (user) {
    await Notification.destroy({ where: { userId: user.userId } });
    const activities = await ActivityLog.findAll({
      where: { authorId: user.userId },
      attributes: ["activityId"],
    });
    const activityIds = activities.map((activity) => activity.activityId);
    if (activityIds.length) {
      await ActivityReaders.destroy({
        where: { activityId: { [Op.in]: activityIds } },
      });
    }
    await ActivityReaders.destroy({ where: { userId: user.userId } });
    await ActivityLog.destroy({ where: { authorId: user.userId } });
    await Comment.destroy({ where: { authorId: user.userId } });
    await CaseAssignees.destroy({ where: { userId: user.userId } });
    await TaskAssignees.destroy({ where: { userId: user.userId } });
    await UserSettings.destroy({ where: { userId: user.userId } });
    await user.destroy();
  }
}

export default {
  createSession: async (req, res) => {
    try {
      await wipeE2eData();

      const user = await User.create({
        auth0Id: E2E_AUTH0_ID,
        username: E2E_EMAIL,
        firstName: "E2E",
        lastName: "Tester",
        email: E2E_EMAIL,
        role: "admin",
        isAllowed: true,
      });

      await UserSettings.create({ userId: user.userId });

      const person = await Person.create(E2E_CLIENT);

      const cas = await Case.create({
        ownerId: user.userId,
        title: E2E_CASE_TITLE,
        isBillable: true,
        billableContact: person.personId,
      });

      await CasePerson.create({
        caseId: cas.caseId,
        personId: person.personId,
        type: "client",
      });

      req.session.user = serializeUser(user);

      res.status(200).json({
        user: serializeUser(user),
        caseId: cas.caseId,
        personId: person.personId,
      });
    } catch (error) {
      console.error("E2E session failed:", error);
      res.status(500).send("Failed to create E2E session");
    }
  },

  linkInvoice: async (req, res) => {
    try {
      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }

      const { invoiceId, caseId, personId } = req.body;
      const invoice = await Invoice.findByPk(invoiceId);

      if (!invoice) {
        return res.status(404).send("Invoice does not exist");
      }

      if (invoice.userId !== req.session.user.userId) {
        return res.status(403).send("Not authorized to edit this invoice");
      }

      await invoice.update({
        caseId: caseId ?? invoice.caseId,
        personId: personId ?? invoice.personId,
      });

      res.status(200).json({ invoiceId: invoice.invoiceId, caseId, personId });
    } catch (error) {
      console.error("E2E link invoice failed:", error);
      res.status(500).send("Failed to link invoice");
    }
  },

  cleanup: async (req, res) => {
    try {
      await wipeE2eData();
      if (req.session) {
        await new Promise((resolve) => req.session.destroy(() => resolve()));
      }
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("E2E cleanup failed:", error);
      res.status(500).send("Failed to clean up E2E data");
    }
  },
};
