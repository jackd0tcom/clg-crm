import React from "react";
import { formatDateNoTimeWithYear } from "../../helpers/helperFunctions";
import {
  getRoundedDuration,
  getRoundedAmountOfEntry,
} from "../../helpers/helperFunctions";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFViewer,
  Image,
} from "@react-pdf/renderer";

const PDFInvoice = ({ invoiceData, billTo, payTo, defaultRate }) => {
  const now = new Date();
  const today = formatDateNoTimeWithYear(now);

  const customChargeTotal =
    invoiceData?.customCharges?.length > 0
      ? invoiceData?.customCharges?.reduce((acc, charge) => {
          return acc + Number(charge.amount);
        }, 0)
      : 0;

  const totalAmount =
    Number(customChargeTotal) +
    invoiceData.entries?.reduce((acc, entry) => {
      return (
        acc +
        getRoundedAmountOfEntry(
          entry.rate ?? defaultRate,
          entry,
          invoiceData.roundingAmount,
        )
      );
    }, 0);

  return (
    <PDFViewer>
      <Document>
        <Page style={styles.body}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View
              style={{
                flexDirection: "column",
                gap: "8px",
                alignItems: "flex-start",
              }}
            >
              <Text style={styles.title}>Invoice</Text>
              <Text style={styles.subtitle}>
                Invoice ID: {invoiceData.invoiceTitle}
              </Text>
              <Text style={styles.subtitle}>Invoice Date: {today}</Text>
            </View>
            <Image
              style={styles.image}
              src="/Clause-Law-Group-Logo-Green.png"
            />
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              gap: 80,
              marginRight: "20%",
              marginTop: "15",
            }}
          >
            <View
              style={{
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 8,
              }}
            >
              <Text style={styles.subtitle}>Billed To:</Text>
              <Text style={styles.subtitle}>{billTo}</Text>
            </View>
            <View
              style={{
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 8,
              }}
            >
              <Text style={styles.subtitle}>Pay To:</Text>
              <Text style={styles.subtitle}>{payTo}</Text>
            </View>
          </View>
          <View style={{ marginTop: 20 }}>
            <View style={styles.row}>
              <Text style={[styles.tableHeader, { flexBasis: 250 }]}>
                DESCRIPTION
              </Text>
              <Text style={[styles.tableHeader, { flexBasis: 30 }]}>RATE</Text>
              <Text style={[styles.tableHeader, { flexBasis: 65 }]}>
                QUANTITY
              </Text>
              <Text
                style={[
                  styles.tableHeader,
                  { flexBasis: 50, textAlign: "right" },
                ]}
              >
                AMOUNT
              </Text>
            </View>
            {invoiceData.entries.map((entry) => (
              <View style={styles.row}>
                <Text style={[styles.text, { flexBasis: 250 }]}>
                  {entry.notes}
                </Text>
                <Text style={[styles.text, { flexBasis: 30 }]}>
                  {entry.rate ?? defaultRate}
                </Text>
                <Text style={[styles.text, { flexBasis: 50 }]}>
                  {getRoundedDuration(entry, invoiceData.roundingAmount)}
                </Text>
                <Text
                  style={[styles.text, { flexBasis: 40, textAlign: "right" }]}
                >
                  $
                  {getRoundedAmountOfEntry(
                    entry.rate ?? defaultRate,
                    entry,
                    invoiceData.roundingAmount,
                  )}
                </Text>
              </View>
            ))}
            {invoiceData.customCharges?.map((charge) => (
              <View style={styles.row}>
                <Text style={styles.text}>{charge.description}</Text>
                <Text style={styles.text}></Text>
                <Text style={styles.text}>${charge.amount}</Text>
              </View>
            ))}
            <View style={styles.row}>
              <Text style={styles.text}>SUBTOTAL</Text>
              <Text style={styles.text}>${totalAmount}</Text>
            </View>
          </View>
          <View style={{ alignItems: "flex-end", padding: 10 }}>
            <Text style={styles.text}>TOTAL</Text>
            <Text>${totalAmount}</Text>
          </View>
          <View style={{ marginTop: 25 }}>
            <Text style={styles.subText}>
              Billing Questions? Please contact our office at (570) 767-52212.
              Visa, MC, Discover and American Express accepted, a service fee of
              4% is added for all Credit Card Accounts! A late charge of 1.5%
              per month applies to all outstanding invoices over 30 days.
              Balances are due ten (10) days from date of invoice.
            </Text>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};

const styles = StyleSheet.create({
  body: {
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 35,
    flexDirection: "column",
    gap: 25,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 10,
  },
  author: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 40,
  },
  subtitle: {
    fontSize: 12,
  },
  tableHeader: {
    fontSize: 12,
    color: "grey",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid lightgrey",
    padding: 10,
  },
  text: {
    fontSize: 12,
    textAlign: "justify",
  },
  subText: {
    fontSize: 10,
    textAlign: "justify",
  },
  image: {
    width: 150,
    height: 50,
  },
  header: {
    fontSize: 12,
    marginBottom: 20,
    textAlign: "center",
    color: "grey",
  },
  pageNumber: {
    position: "absolute",
    fontSize: 12,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "grey",
  },
});

export default PDFInvoice;
