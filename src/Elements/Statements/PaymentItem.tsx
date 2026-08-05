import { useNavigate } from "react-router";
import {
  formatNumericalDate,
  formatDollarNoCents,
} from "../../helpers/helperFunctions";

interface props {
  payment: any;
}

const PaymentItem = ({ payment }: props) => {
  const nav = useNavigate();
  const clientName = payment.person
    ? `${payment.person?.firstName} ${payment.person?.lastName}`
    : payment.title;
  return (
    <div className="payment-item">
      <div>
        {formatNumericalDate(payment?.paidDate ?? payment?.createdAt ?? null)}
      </div>
      <div
        className={payment.title && "invoice-link"}
        onClick={() => payment.title && nav(`/invoice/${payment.invoiceId}`)}
      >
        {clientName}
      </div>
      <div>{payment.description}</div>
      <div
        className={
          payment.description === "Invoice"
            ? "payment-item-total subtract-payment"
            : "payment-item-total add-payment"
        }
      >
        {payment.description === "Invoice" && "-"}
        {formatDollarNoCents(payment.amount)}
      </div>
    </div>
  );
};
export default PaymentItem;
