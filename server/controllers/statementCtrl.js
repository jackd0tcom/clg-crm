import {
  Case,
  User,
  Person,
  Task,
  TimeEntry,
  Invoice,
  UserSettings,
  CustomCharge,
  EntryService,
  Rate,
  Payment,
} from "../model.js";
import { Op } from "sequelize";

const now = () => {
  return Date.now();
};

const getItem = async (type, id) => {
  let item;
  let idField;
  switch (type) {
    case "invoice":
      item = await Invoice.findOne({
        where: { invoiceId: id },
        include: [
          {
            model: Payment,
            as: "payments",
          },
        ],
      });
      idField = "invoiceId";
      break;
    case "case":
      item = await Case.findOne({
        where: { caseId: id },
        include: [
          {
            model: Payment,
            as: "payments",
          },
        ],
      });
      idField = "caseId";
      break;
    case "person":
      item = await Person.findOne({
        where: { personId: id },
        include: [
          {
            model: Payment,
            as: "payments",
          },
        ],
      });
      idField = "personId";
      break;

    default:
      break;
  }
  return { item, idField };
};

export default {
  addPayment: async (req, res) => {
    try {
      console.log("addPayment");
      const { objects, payment, personId } = req.body;

      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }

      let items;
      if (objects.length > 1) {
        items = await Promise.all(
          objects.map(async (object) => {
            const { item, idField } = await getItem(object.type, object.id);
            return { item: item, idField: idField };
          }),
        );
      } else {
        const { item, idField } = await getItem(objects[0].type, objects[0].id);
        items = [{ item, idField }];
      }

      if (!items) {
        return res.status(404).send("Item does not exist");
      }

      const relations = Object.assign(
        {},
        ...items.map(({ item, idField }) => ({
          [idField]: item[idField],
        })),
      );

      const newPayment = await Payment.create({
        ...relations,
        description: payment.paidDescription,
        amount: payment.paidAmount,
        paidDate: payment.paidDate,
        personId: personId ?? null,
      });

      const updatedPayment = await Payment.findOne({
        where: { paymentId: newPayment.paymentId },
        include: [{ model: Person, as: "person", required: false }],
      });

      res.status(200).send(updatedPayment);
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  },
  updatePayment: async (req, res) => {
    try {
      console.log("updatePayment");
      const { paymentId, payment } = req.body;

      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }

      const foundPayment = await Payment.findByPk(paymentId);

      if (!foundPayment) {
        return res.status(404).send("Payment does not exist");
      }

      const updatedPayment = await foundPayment.update({
        description: payment.description,
        amount: payment.amount,
        paidDate: payment.paidDate,
      });

      res.status(200).send(updatedPayment);
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  },
  getPayments: async (req, res) => {
    try {
      console.log("getPayments");

      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }

      const payments = await Payment.findAll({
        include: [{ model: Person, as: "person" }],
      });

      const invoices = await Invoice.findAll({
        include: [
          {
            model: TimeEntry,
            as: "timeEntries",
            include: [{ model: Rate, as: "rate" }],
          },
          {
            model: CustomCharge,
            as: "customCharges",
          },
          {
            model: Case,
            as: "case",
            include: {
              model: Person,
              as: "billablePerson",
            },
          },
        ],
      });

      if (!payments) {
        return res.status(404).send("No payments found");
      }

      const payload = {
        payments,
        invoices,
      };

      res.status(200).send(payload);
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  },
  createMonthlyStatements: async (req, res) => {
    try {
      console.log("createMonthlyStatements");
      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }
      const { startDate, endDate } = req.body;

      const now = new Date();
      const firstDay = startDate
        ? new Date(startDate)
        : new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = endDate
        ? new Date(endDate)
        : new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const dateRange = { [Op.between]: [firstDay, lastDay] };

      const entriesInRange = await Payment.findAll({
        attributes: ["caseId"],
        where: { paidDate: dateRange, caseId: { [Op.ne]: null } },
        group: ["caseId"],
        raw: true,
      });
      const invoicesInRange = await Invoice.findAll({
        attributes: ["caseId"],
        where: { createdAt: dateRange, caseId: { [Op.ne]: null } },
        group: ["caseId"],
        raw: true,
      });
      const caseIds = [
        ...new Set([
          ...entriesInRange.map((e) => e.caseId),
          ...invoicesInRange.map((i) => i.caseId),
        ]),
      ];
      if (!caseIds.length) {
        return res.status(200).send([]);
      }
      const billableCases = await Case.findAll({
        where: { caseId: { [Op.in]: caseIds } },
        include: [
          { model: Payment, as: "payments", required: false, separate: true },
          {
            model: Invoice,
            as: "invoices",
            required: false,
            separate: true,
            include: [
              {
                model: TimeEntry,
                as: "timeEntries",
                include: [{ model: Rate, as: "rate" }],
              },
              {
                model: CustomCharge,
                as: "customCharges",
              },
            ],
          },
          { model: Person, as: "people" },
        ],
      });

      if (!billableCases.length) {
        return res.status(200).send([]);
      }

      return res.status(200).send(billableCases);
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  },
};
