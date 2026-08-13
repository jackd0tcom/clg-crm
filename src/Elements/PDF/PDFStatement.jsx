import React from "react";
import { formatDateNoTimeWithYear } from "../../helpers/helperFunctions";
import {
  getRoundedDuration,
  getRoundedAmountOfEntry,
  formatNumericalDate,
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

const PDFStatement = ({ statementData, statements }) => {
  const now = new Date();
  const today = formatDateNoTimeWithYear(now);

  const firstClient = statements[0]?.person ?? null;

  const clientName = `${firstClient?.firstName ?? null} ${firstClient?.lastName ?? null}`;

  const totalAmount = statements.reduce((acc, statement) => {
    if (statement.paymentId) {
      return acc + statement.amount;
    } else return acc - statement.amount;
  }, 0);

  return (
    <PDFViewer>
      <Document
        title={`${formatNumericalDate(today)}-${clientName}-Statements`}
      >
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
              <Text style={styles.title}>Statement</Text>
              <Text style={styles.subtitle}>Statement Date: {today}</Text>
              <Text style={styles.subtitle}>Client Name: {clientName}</Text>
            </View>
            <Image
              style={styles.image}
              src="/Clause-Law-Group-Logo-Green.png"
            />
          </View>
          <View style={{ marginTop: 20 }}>
            <View style={styles.row}>
              <Text style={[styles.tableHeader, { flexBasis: 100 }]}>DATE</Text>
              <Text style={[styles.tableHeader, { flexBasis: 250 }]}>
                DESCRIPTION
              </Text>
              <Text
                style={[
                  styles.tableHeader,
                  { flexBasis: 80, textAlign: "right" },
                ]}
              >
                TOTAL
              </Text>
            </View>
            {statements?.map((statement) => (
              <View style={styles.row}>
                <Text style={[styles.text, { flexBasis: 100 }]}>
                  {formatNumericalDate(statement.paidDate) ?? ""}
                </Text>
                <Text style={[styles.text, { flexBasis: 250 }]}>
                  {statement.paymentId
                    ? (statement.description ?? "")
                    : `Invoice - ${statement.description}`}
                </Text>
                <Text
                  style={
                    !statement.paymentId
                      ? [
                          styles.text,
                          {
                            flexBasis: 80,
                            textAlign: "right",
                            color: "darkred",
                          },
                        ]
                      : [styles.text, { flexBasis: 80, textAlign: "right" }]
                  }
                >
                  {statement.paymentId
                    ? `$${statement.amount}`
                    : `($${statement.amount})`}
                </Text>
              </View>
            ))}
            {/* <View style={styles.row}>
              <Text style={styles.text}>SUBTOTAL</Text>
              <Text style={styles.text}>${totalAmount}</Text>
            </View> */}
          </View>
          <View style={{ alignItems: "flex-end", padding: 10 }}>
            <Text style={styles.text}>
              {totalAmount > 0 ? "BALANCE" : "BALANCE OWED"}
            </Text>
            <Text>
              ${totalAmount > 0 ? totalAmount : Math.abs(totalAmount)}
            </Text>
          </View>
          <View style={{ marginTop: 25 }}>
            <Text style={styles.subText}>
              Billing Questions? Please contact our office at (570) 676-2527.
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

export default PDFStatement;
