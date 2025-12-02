import { useState } from "react";
import axios from "axios";

const NewPracticeArea = ({ setAllAreas, creating, setCreating }) => {
  const [newArea, setNewArea] = useState("");
  const [count, setCount] = useState(0);

  const createArea = async () => {
    try {
      await axios
        .post("/api/newPracticeArea", { name: newArea })
        .then((res) => {
          if (res.status === 201) {
            setAllAreas((prev) => [...prev, res.data]);
          }
        });
    } catch (error) {}
  };

  const handleEnter = (e) => {
    if (e.key === "Escape") {
      setCreating(false);
      setCount(0);
      return;
    }
    if (e.key === "Enter") {
      if (count > 0 && creating) {
        // Only save if user has actually typed and not currently saving or creating
        if (newArea) {
          console.log(newArea);
          createArea();
          setCount(0);
          setCreating(false);
        }
      }
    }
  };

  return (
    <div className="practice-area-item">
      <input
        type="text"
        value={newArea}
        autoFocus={creating}
        onChange={(e) => {
          setNewArea(e.target.value);
          setCount((prevCount) => prevCount + 1);
        }}
        onKeyDown={handleEnter}
        placeholder="Practice Area Title"
      />
    </div>
  );
};
export default NewPracticeArea;
