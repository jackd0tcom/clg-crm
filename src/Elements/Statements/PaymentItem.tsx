import { useNavigate } from "react-router";
import {
  formatDollarNoCents,
  formatDateNoTimeWithYear,
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
        {formatDateNoTimeWithYear(
          payment?.paidDate ?? payment?.createdAt ?? null,
        )}
      </div>
      <div>{clientName}</div>
      <div
        className={payment.title && "invoice-link"}
        onClick={() => payment.title && nav(`/invoice/${payment.invoiceId}`)}
      >
        {payment.description}
      </div>
      <div
        className={
          !payment.paymentId
            ? "payment-item-total subtract-payment"
            : "payment-item-total add-payment"
        }
      >
        {payment.paymentId
          ? formatDollarNoCents(payment.amount)
          : `(${formatDollarNoCents(payment.amount)})`}
      </div>
    </div>
  );
};
export default PaymentItem;
