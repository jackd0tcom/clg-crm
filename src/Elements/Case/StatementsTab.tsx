import PaymentList from "../Statements/PaymentList";

interface props {
  payments: any;
  invoices: any;
}

const StatementsTab = ({ payments, invoices }: props) => {
  return (
    <div className="statements-tab-wrapper">
      <PaymentList
        payments={payments}
        invoices={invoices}
        headless={false}
        caseView={true}
      />
    </div>
  );
};
export default StatementsTab;
