import { Case, User, Person, Task, TimeEntry, Invoice } from "../model.js";
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

      const invoice = await Invoice.findByPk(invoiceId);

      if (!invoice) {
        res.status(401).send("Invoice does not exist");
        return;
      }

      const invoiceItems = await TimeEntry.findAll({
        where: { invoiceId: invoice.invoiceId },
      });

      const invoiceData = invoice.toJSON();

      const invoiceWithItems = {
        ...invoiceData,
        entries: invoiceItems,
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
      });

      if (!invoices) {
        res.status(401).send("Invoice does not exist");
        return;
      }

      const invoicesWithItems = await Promise.all(
        invoices.map(async (invoice) => {
          const entries = await TimeEntry.findAll({
            where: { invoiceId: invoice.invoiceId },
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
      const { invoiceTitle } = req.body;
      if (!req.session.user) {
        return res.status(401).send("User not authenticated");
      }
      const newInvoice = await Invoice.create({ invoiceTitle });

      res.status(200).send(newInvoice);
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
};
