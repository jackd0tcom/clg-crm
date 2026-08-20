import { formatDollar } from "../../helpers/helperFunctions";

interface props {
  payments: any;
  total?: number;
}

const StatementsFooter = ({ payments, total }: props) => {
  let paymentsTotal = payments.reduce((acc: number, payment: any) => {
    if (payment.title) {
      return acc - (payment.amount ?? 0);
    } else return (acc += payment.amount ?? 0);
  }, 0);

  if (total) {
    paymentsTotal = paymentsTotal - total;
  }
  return (
    <div className="statements-footer-wrapper">
      <div className="statements-footer payment-item">
        <div></div>
        <div></div>
        <div></div>
        <div
          className={
            paymentsTotal > 0
              ? "payment-item-total add-payment"
              : "payment-item-total subtract-payment"
          }
        >
          Total: {formatDollar(paymentsTotal)}
        </div>
      </div>
    </div>
  );
};
export default StatementsFooter;
