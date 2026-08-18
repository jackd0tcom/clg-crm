import {
  User,
  UserSettings,
  Person,
  Case,
  CasePerson,
  Invoice,
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

export default {
  createSession: async (req, res) => {
    try {
      let user = await User.findOne({
        where: { email: E2E_EMAIL },
      });

      if (!user) {
        user = await User.create({
          auth0Id: E2E_AUTH0_ID,
          username: E2E_EMAIL,
          firstName: "E2E",
          lastName: "Tester",
          email: E2E_EMAIL,
          role: "admin",
          isAllowed: true,
        });
      } else if (!user.isAllowed) {
        await user.update({ isAllowed: true, role: user.role || "admin" });
      }

      const settings = await UserSettings.findOne({
        where: { userId: user.userId },
      });
      if (!settings) {
        await UserSettings.create({ userId: user.userId });
      }

      let person = await Person.findOne({ where: { email: E2E_CLIENT.email } });
      if (!person) {
        person = await Person.create(E2E_CLIENT);
      }

      let [cas] = await Case.findOrCreate({
        where: { ownerId: user.userId, title: E2E_CASE_TITLE },
        defaults: {
          ownerId: user.userId,
          title: E2E_CASE_TITLE,
          isBillable: true,
          billableContact: person.personId,
        },
      });

      if (!cas.billableContact) {
        await cas.update({ billableContact: person.personId });
      }

      const existingLink = await CasePerson.findOne({
        where: { caseId: cas.caseId, personId: person.personId },
      });
      if (!existingLink) {
        await CasePerson.create({
          caseId: cas.caseId,
          personId: person.personId,
          type: "client",
        });
      }

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
};
