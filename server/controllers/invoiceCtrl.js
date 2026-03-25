import {
  Case,
  User,
  Person,
  Task,
  TimeEntry,
  Invoice,
  UserSettings,
  CustomCharge,
} from "../model.js";
import { Op } from "sequelize";

const now = () => {
  return Date.now();
};

export default {
  getInvoice: async (req, res) => {
    try {
      console.log("getInvoice");
      const { invoiceId } = req.params;

      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }

      const invoice = await Invoice.findOne({
        where: { invoiceId },
        include: [
          {
            model: CustomCharge,
            as: "customCharges",
          },
        ],
      });

      if (!invoice) {
        res.status(404).send("Invoice does not exist");
        return;
      }

      const invoiceItems = await TimeEntry.findAll({
        where: { invoiceId: invoice.invoiceId },
        include: [
          {
            model: Case,
            as: "case",
            required: false,
            include: [{ model: Person, as: "people" }],
          },
          { model: Task, as: "task", required: false },
        ],
      });

      const userSettings = await UserSettings.findOne({
        where: { userId: req.session.user.userId },
      });

      const invoiceData = invoice.toJSON();

      const invoiceWithItems = {
        ...invoiceData,
        entries: invoiceItems,
        settings: userSettings,
      };

      res.status(200).send(invoiceWithItems);
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  },
  getInvoices: async (req, res) => {
    try {
      console.log("getInvoices");

      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }

      const invoices = await Invoice.findAll({
        where: { userId: req.session.user.userId },
        order: [["updatedAt", "DESC"]],
      });

      if (!invoices) {
        res.status(401).send("Invoice does not exist");
        return;
      }

      const invoicesWithItems = await Promise.all(
        invoices.map(async (invoice) => {
          const entries = await TimeEntry.findAll({
            where: { invoiceId: invoice.invoiceId },
            include: [
              {
                model: Case,
                as: "case",
                required: false,
                include: [{ model: Person, as: "people" }],
              },
              { model: Task, as: "task", required: false },
            ],
          });

          const invoiceData = invoice.toJSON();

          return { ...invoiceData, entries: entries };
        }),
      );

      res.status(200).send(invoicesWithItems);
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  },
  markAsPaid: async (req, res) => {
    try {
      console.log("markAsPaid");
      const { invoiceId, isPaid } = req.body;
      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }
      const currentInvoice = await Invoice.findOne({ where: { invoiceId } });

      if (!currentInvoice) {
        res.status(401).send("Invoice does not exist");
        return;
      }

      const updatedInvoice = await currentInvoice.update({
        isPaid: isPaid,
      });

      res.status(200).send(updatedInvoice);
    } catch (error) {
      console.log(error);
      res.status(401).send(error);
    }
  },
  newInvoice: async (req, res) => {
    try {
      console.log("newInvoice");
      const { entries } = req.body;
      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }
      const newInvoice = await Invoice.create({
        userId: req.session.user.userId,
      });

      const updatedEntries = await Promise.all(
        entries.map(async (entry) => {
          const currentEntry = await TimeEntry.findByPk(entry);
          await currentEntry.update({ invoiceId: newInvoice.invoiceId });
          return currentEntry;
        }),
      );

      const invoiceData = newInvoice.toJSON();

      const payload = {
        ...invoiceData,
        entries: updatedEntries,
      };

      res.status(200).send(payload);
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  },
  newCustomCharge: async (req, res) => {
    try {
      console.log("newCustomCharge");
      const { invoiceId } = req.body;
      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }
      const currentInvoice = await Invoice.findByPk(invoiceId);

      if (!currentInvoice) {
        res.status(404).send("Invoice does not exist");
      }

      const newCharge = CustomCharge.create({ invoiceId });

      res.status(200).send(newCharge);
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  },
  deleteInvoice: async (req, res) => {
    try {
      console.log("deleteInvoice");
      const { invoiceId } = req.body;
      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }
      const currentInvoice = await Invoice.findOne({ where: { invoiceId } });

      if (!currentInvoice) {
        res.status(401).send("Invoice does not exist");
        return;
      }

      await currentInvoice.destroy();

      res.status(200).send("Invoice deleted successfully");
    } catch (error) {
      console.log(error);
      res.status(401).send(error);
    }
  },
  saveInvoice: async (req, res) => {
    try {
      console.log("saveInvoice");
      const { invoiceData } = req.body;

      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }

      if (!invoiceData?.invoiceId) {
        return res.status(400).send("Missing invoiceId");
      }

      const invoice = await Invoice.findOne({
        where: { invoiceId: invoiceData.invoiceId },
      });

      if (!invoice) {
        return res.status(404).send("Invoice does not exist");
      }

      if (invoice.userId !== req.session.user.userId) {
        return res.status(403).send("Not authorized to edit this invoice");
      }

      console.log(invoiceData);

      const updatedInvoice = await invoice.update({
        invoiceTitle: invoiceData.invoiceTitle,
        invoiceStatus: invoiceData.invoiceStatus,
        roundingAmount: invoiceData.roundingAmount,
        isPaid: invoiceData.isPaid,
        billTo: invoiceData.billTo,
        payTo: invoiceData.payTo,
      });

      const entries = invoiceData.entries ?? [];
      const updatedItems = await Promise.all(
        entries.map(async (entry) => {
          if (!entry?.timeEntryId) return null;
          const foundEntry = await TimeEntry.findByPk(entry.timeEntryId);
          if (!foundEntry) return null;
          const {
            notes,
            startTime,
            endTime,
            isRunning,
            invoiceId,
            isPaid,
            rate,
          } = entry;
          return await foundEntry.update({
            notes,
            startTime,
            endTime,
            isRunning,
            invoiceId,
            isPaid,
            rate,
          });
        }),
      );

      const customCharges = invoiceData.customCharges ?? [];
      const updatedCharges = await Promise.all(
        customCharges.map(async (charge) => {
          if (charge.chargeId) {
            const foundCharge = await CustomCharge.findByPk(charge.chargeId);
            if (!foundCharge) return null;
            return await foundCharge.update({
              description: charge.description,
              amount: charge.amount,
            });
          }
          return await CustomCharge.create({
            invoiceId: invoice.invoiceId,
            description: charge.description ?? null,
            amount: charge.amount ?? null,
          });
        }),
      );

      const updatedInvoiceData = updatedInvoice.toJSON();
      const validItems = updatedItems.filter(Boolean);
      const validCharges = updatedCharges.filter(Boolean);

      const updatedData = {
        ...updatedInvoiceData,
        entries: validItems,
        charges: validCharges,
      };

      res.status(200).send(updatedData);
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  },
  updateInvoiceStatus: async (req, res) => {
    try {
      console.log("updateInvoiceStatus");
      const { invoiceId, status, entryIds } = req.body;

      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }

      const invoice = await Invoice.findOne({
        where: { invoiceId },
      });

      if (!invoice) {
        return res.status(404).send("Invoice does not exist");
      }

      if (invoice.userId !== req.session.user.userId) {
        return res.status(403).send("Not authorized to edit this invoice");
      }

      const updatedInvoice = await invoice.update({
        invoiceStatus: status,
      });

      const updatedEntries = await Promise.all(
        entryIds.map(async (id) => {
          const currentEntry = await TimeEntry.findByPk(id);
          const updatedEntry = currentEntry.update({
            paidStatus: status,
          });
          const entryWithItem = await TimeEntry.findOne({
            where: { timeEntryId: id },
            include: [
              {
                model: Case,
                as: "case",
                required: false,
                include: [{ model: Person, as: "people" }],
              },
              { model: Task, as: "task", required: false },
            ],
          });
          return entryWithItem;
        }),
      );

      const invoiceData = updatedInvoice.toJSON();

      const payload = {
        ...invoiceData,
        entries: updatedEntries,
      };

      res.status(200).send(payload);
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  },
};
