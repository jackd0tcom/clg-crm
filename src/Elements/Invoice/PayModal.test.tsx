/** @vitest-environment happy-dom */
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import PayModal from "./PayModal.tsx";

vi.mock("../UI/DatePicker", () => ({
  default: () => <div>datepicker</div>,
}));

vi.mock("./ClientPicker", () => ({
  default: ({ clientName }) => <div>client:{clientName}</div>,
}));

const ada = { personId: 1, firstName: "Ada", lastName: "Lovelace" };
const lin = { personId: 2, firstName: "Lin", lastName: "Mayer" };

const renderModal = (overrides = {}) => {
  const handlePay = vi.fn();
  const view = render(
    <PayModal
      project={{ billableContact: 1, ...overrides.project }}
      existingPayment={overrides.existingPayment}
      handlePay={handlePay}
      clientList={overrides.clientList ?? [ada, lin]}
      icon={overrides.icon ?? false}
      right={overrides.right}
    />,
  );
  return { handlePay, ...view };
};

describe("PayModal", () => {
  afterEach(() => {
    cleanup();
  });

  it("defaults the client to the project's billable contact", () => {
    renderModal();

    fireEvent.click(screen.getByRole("button", { name: "Add Payment" }));

    expect(
      screen.getByRole("heading", { name: "Case Payment" }),
    ).toBeInTheDocument();
    expect(screen.getByText("client:Ada Lovelace")).toBeInTheDocument();
  });

  it("labels the modal as an invoice payment when the project has an invoiceId", () => {
    renderModal({ project: { billableContact: 1, invoiceId: 10 } });

    fireEvent.click(screen.getByRole("button", { name: "Add Payment" }));

    expect(
      screen.getByRole("heading", { name: "Invoice Payment" }),
    ).toBeInTheDocument();
  });

  it("hides Save until amount and description are both set", () => {
    renderModal();
    fireEvent.click(screen.getByRole("button", { name: "Add Payment" }));

    expect(screen.queryByRole("button", { name: "Save" })).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "250" } });
    expect(screen.queryByRole("button", { name: "Save" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Select a Description" }));
    fireEvent.click(screen.getByText("Invoice Payment"));

    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("calls handlePay with the filled-in payment and then resets", () => {
    const { handlePay } = renderModal({
      existingPayment: {
        paidDate: "2026-08-18",
        paidAmount: 0,
        paidDescription: "",
        personId: 1,
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "Add Payment" }));
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "250" } });
    fireEvent.click(screen.getByRole("button", { name: "Select a Description" }));
    fireEvent.click(screen.getByText("Retainer Payment"));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(handlePay).toHaveBeenCalledWith(
      expect.objectContaining({
        paidAmount: 250,
        paidDescription: "Retainer Payment",
        personId: 1,
      }),
    );
    expect(
      screen.queryByRole("heading", { name: "Case Payment" }),
    ).not.toBeInTheDocument();
  });
});
