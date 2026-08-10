import axios from "axios";
import ProjectPicker from "./ProjectPicker";

interface props {
  setEntriesRefreshKey: any;
  caseId: number;
  charge: any;
  setCharge: any;
}

const CustomChargeWidget = ({
  setEntriesRefreshKey,
  caseId,
  charge,
  setCharge,
}: props) => {
  const canSave = charge.description !== "" && charge.amount !== 0;

  const addCharge = async () => {
    try {
      await axios
        .post("/api/newCharge", {
          description: charge.description,
          amount: charge.amount,
          caseId,
        })
        .then(() => {
          setEntriesRefreshKey?.((prev: any) => (prev += 1));
          setCharge({ chargeId: null, description: "", amount: 0 });
        });
    } catch (error) {
      console.log(error);
      return Promise.reject(error);
    }
  };
  const updateCharge = async () => {
    try {
      await axios
        .post("/api/updateCharge", {
          chargeId: charge.chargeId,
          description: charge.description,
          amount: charge.amount,
        })
        .then((res: any) => {
          console.log(res.data);
          setEntriesRefreshKey?.((prev: any) => (prev += 1));
        });
    } catch (error) {
      console.log(error);
      return Promise.reject(error);
    }
  };
  return (
    <div className="custom-charge-widget">
      <div className="custom-charge-wrapper">
        <div className="custom-charge-item">
          <p>Description</p>
          <input
            type="text"
            className="custom-charge-input"
            value={charge.description}
            onChange={(e) =>
              setCharge({ ...charge, description: e.target.value })
            }
          />
        </div>
        <div className="custom-charge-item">
          <p>Amount</p>
          <span className="custom-charge-amount-item">
            $
            <input
              className="custom-charge-input"
              type="number"
              value={charge.amount}
              onChange={(e) =>
                setCharge({ ...charge, amount: Number(e.target.value) })
              }
            />
          </span>
        </div>
        {/* <ProjectPicker /> */}
        <div className="save-button-wrapper">
          <button
            disabled={!canSave}
            onClick={charge.chargeId ? updateCharge : addCharge}
            className="entry-save-button"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
export default CustomChargeWidget;
