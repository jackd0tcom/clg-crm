import { formatDollarNoCents } from "../../helpers/helperFunctions";

interface props {
  payments: any;
}

const StatementsFooter = ({ payments }: props) => {
  const total = payments.reduce((acc: number, payment: any) => {
    if (payment.title) {
      return acc - (payment.amount ?? 0);
    } else return (acc += payment.amount ?? 0);
  }, 0);
  return (
    <div className="statements-footer-wrapper">
      <div className="statements-footer payment-item">
        <div></div>
        <div></div>
        <div></div>
        <div className="payment-item-total">
          Total: {formatDollarNoCents(total)}
        </div>
      </div>
    </div>
  );
};
export default StatementsFooter;
