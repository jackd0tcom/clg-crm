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

const PDFInvoice = ({
  invoiceData,
  billTo,
  payTo,
  defaultRate,
  entryServices,
  rates,
}) => {
  const now = new Date();
  const today = formatDateNoTimeWithYear(now);

  const getRate = (item) => {
    return rates.find((rate) => rate.rateId === item.rateId)?.rate ?? 0;
  };

  const getServiceTitle = (id) => {
    return (
      entryServices?.find((service) => service.entryServiceId === id)
        ?.serviceTitle ?? ""
    );
  };

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
          getRate(entry),
          entry,
          invoiceData.roundingAmount,
        )
      );
    }, 0);

  const combined = [...invoiceData.entries, ...invoiceData.customCharges];

  const sorted = combined.sort((a, b) => {
    const aStart = a.chargeId ? a.createdAt : a.endTime;
    const bStart = b.chargeId ? b.createdAt : b.endTime;

    return new Date(aStart).getTime() - new Date(bStart).getTime();
  });

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
                <Text style={styles.bold}>INVOICE ID:</Text>{" "}
                {invoiceData.invoiceTitle}
              </Text>
              <Text style={styles.subtitle}>
                <Text style={styles.bold}>INVOICE DATE:</Text> {today}
              </Text>
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
              <Text style={[styles.subtitle, styles.bold]}>Billed To:</Text>
              <Text style={styles.subtitle}>{billTo}</Text>
            </View>
            <View
              style={{
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 8,
              }}
            >
              <Text style={[styles.subtitle, styles.bold]}>Pay To:</Text>
              <Text style={styles.subtitle}>{payTo}</Text>
            </View>
          </View>
          <View style={{ marginTop: 20 }}>
            <View style={styles.topRow}>
              <Text style={[styles.tableHeader, { flexBasis: 100 }]}>DATE</Text>
              <Text style={[styles.tableHeader, { flexBasis: 250 }]}>
                DESCRIPTION
              </Text>
              <Text style={[styles.tableHeader, { flexBasis: 80 }]}>TIME</Text>
              <Text
                style={[
                  styles.tableHeader,
                  { flexBasis: 80, textAlign: "right" },
                ]}
              >
                TOTAL
              </Text>
            </View>
            {sorted.map((entry) => {
              return entry.chargeId ? (
                <View style={styles.row}>
                  <Text style={[styles.text, { flexBasis: 100 }]}>
                    {formatNumericalDate(entry.createdAt)}
                  </Text>
                  <Text style={[styles.text, { flexBasis: 250 }]}>
                    {entry.description}
                  </Text>
                  <Text style={[styles.text, { flexBasis: 80 }]}></Text>
                  <Text
                    style={[styles.text, { flexBasis: 80, textAlign: "right" }]}
                  >
                    ${entry.amount}
                  </Text>
                </View>
              ) : (
                <View style={styles.row}>
                  <Text style={[styles.text, { flexBasis: 100 }]}>
                    {formatNumericalDate(entry.endTime) ?? ""}
                  </Text>
                  <Text style={[styles.text, { flexBasis: 250 }]}>
                    {getServiceTitle(entry.entryServiceId) ?? entry.notes}
                  </Text>
                  <Text style={[styles.text, { flexBasis: 80 }]}>
                    {getRoundedDuration(entry, invoiceData.roundingAmount)}
                  </Text>
                  <Text
                    style={[styles.text, { flexBasis: 80, textAlign: "right" }]}
                  >
                    $
                    {getRoundedAmountOfEntry(
                      getRate(entry),
                      entry,
                      invoiceData.roundingAmount,
                    )}
                  </Text>
                </View>
              );
            })}
            {/* {invoiceData.entries.map((entry) => (
              <View style={styles.row}>
                <Text style={[styles.text, { flexBasis: 100 }]}>
                  {formatNumericalDate(entry.endTime) ?? ""}
                </Text>
                <Text style={[styles.text, { flexBasis: 250 }]}>
                  {getServiceTitle(entry.entryServiceId) ?? entry.notes}
                </Text>
                <Text style={[styles.text, { flexBasis: 80 }]}>
                  {getRoundedDuration(entry, invoiceData.roundingAmount)}
                </Text>
                <Text
                  style={[styles.text, { flexBasis: 80, textAlign: "right" }]}
                >
                  $
                  {getRoundedAmountOfEntry(
                    getRate(entry),
                    entry,
                    invoiceData.roundingAmount,
                  )}
                </Text>
              </View>
            ))} */}
            {/* {invoiceData.customCharges?.map((charge) => (
              <View style={styles.row}>
                <Text style={[styles.text, { flexBasis: 100 }]}>
                  {formatNumericalDate(charge.createdAt)}
                </Text>
                <Text style={[styles.text, { flexBasis: 250 }]}>
                  {charge.description}
                </Text>
                <Text style={[styles.text, { flexBasis: 80 }]}></Text>
                <Text
                  style={[styles.text, { flexBasis: 80, textAlign: "right" }]}
                >
                  ${charge.amount}
                </Text>
              </View>
            ))} */}
            <View style={styles.row}>
              <Text style={styles.text}>SUBTOTAL</Text>
              <Text style={styles.text}>${totalAmount}</Text>
            </View>
          </View>
          <View style={styles.footer}>
            <Text style={styles.text}>TOTAL</Text>
            <Text style={styles.total}>${totalAmount}</Text>
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
    fontSize: 20,
    textAlign: "center",
    textTransform: "uppercase",
    marginBottom: 10,
    fontWeight: 600,
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
    color: "white",
  },
  bold: {
    fontWeight: 600,
    fontSize: 12,
    textTransform: "uppercase",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    paddingVertical: 6,
    backgroundColor: "#08331e",
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
    width: 200,
    height: 60,
  },
  header: {
    fontSize: 12,
    marginBottom: 20,
    textAlign: "center",
    color: "white",
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
  footer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f6f6f6",
    justifyContent: "flex-end",
    gap: 20,
  },
  total: {
    backgroundColor: "#08331e",
    padding: 10,
    paddingHorizontal: 30,
    color: "white",
    fontWeight: 500,
  },
});

export default PDFInvoice;
