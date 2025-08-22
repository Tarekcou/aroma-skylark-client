import React from "react";
import { PDFViewer, Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

// Register Bangla font once
Font.register({
  family: "NotoSansBengali",
  src: "/fonts/NotoSansBengali-Regular.ttf",
});

const styles = StyleSheet.create({
  page: { fontFamily: "NotoSansBengali", padding: 20, fontSize: 10 },
  tableHeader: { flexDirection: "row", borderBottom: 1, borderColor: "#000", marginBottom: 5 },
  tableRow: { flexDirection: "row", borderBottom: 1, borderColor: "#ccc", paddingVertical: 3 },
  cell: { flex: 1, textAlign: "center" },
  headerText: { fontWeight: "bold" },
  totalRow: { flexDirection: "row", marginTop: 5 },
});

const PDFPreview = ({ entries = [], page = 1, itemsPerPage = 10 }) => {
  const totalExpense = entries.reduce((sum, e) => sum + Number(e.expense || 0), 0);

  return (
    <PDFViewer width="100%" height="600">
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={{ fontSize: 18, marginBottom: 10, textAlign: "center" }}>All Transactions</Text>
          <Text style={{ marginBottom: 10 }}>Date: {new Date().toLocaleDateString("en-GB")}</Text>

          {/* Table Header */}
          <View style={styles.tableHeader}>
            {["#", "Date", "Remarks", "Category", "Type", "Division", "Pmt Mode", "Amount", "Balance", "Expenses"].map((h) => (
              <Text style={[styles.cell, styles.headerText]} key={h}>{h}</Text>
            ))}
          </View>

          {/* Table Rows */}
          {entries.map((e, i) => (
            <View style={styles.tableRow} key={i}>
              <Text style={styles.cell}>{(page - 1) * itemsPerPage + i + 1}</Text>
              <Text style={styles.cell}>{new Date(e.date).toLocaleDateString("bn-BD")}</Text>
              <Text style={styles.cell}>{e.remarks || "-"}</Text>
              <Text style={styles.cell}>{e.category || "-"}</Text>
              <Text style={styles.cell}>{e.type || "-"}</Text>
              <Text style={styles.cell}>{e.division || "-"}</Text>
              <Text style={styles.cell}>{e.mode || "-"}</Text>
              <Text style={styles.cell}>{e.amount || "-"}</Text>
              <Text style={styles.cell}>{e.balance || "-"}</Text>
              <Text style={styles.cell}>{e.expense || "-"}</Text>
            </View>
          ))}

          {/* Total Expense Row */}
          <View style={styles.totalRow}>
            <Text style={{ flex: 6 }}></Text>
            <Text style={[styles.cell, styles.headerText]}>Total Expense</Text>
            <Text style={[styles.cell, { flex: 3 }]}>{totalExpense}</Text>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};

export default PDFPreview;
