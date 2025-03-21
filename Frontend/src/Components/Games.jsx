import { useState, useEffect } from "react";
import GameData from "./gameData.json";
import Loader from "./Loader";

export default function Games() {
  const [icons, setIcons] = useState([]);
  const [groupId, setGroupId] = useState("1");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadIcons = async () => {
      setLoading(true);
      const groupData = GameData.find((group) => group[groupId]);
      if (groupData) {
        const iconsArray = await Promise.all(
          groupData[groupId].map(async (icon) => {
            const imageUrl = await import(`../assets/icons/${icon.img}.jpg`);
            return { ...icon, url: imageUrl.default };
          })
        );
        setIcons(iconsArray);
      }
      setLoading(false);
    };
    loadIcons();
  }, [groupId]);

  const setGameId = (id) => {
    sessionStorage.setItem("gameId", id);
    localStorage.setItem("gameId", id);
  };

  const handleGroupChange = (e) => {
    setGroupId(e.target.value);
  };

  return (
    <div className="p-3">
      <div className="container">
        <div className="row mb-4">
          <div className="col">
            <select
              onChange={handleGroupChange}
              value={groupId}
              className="form-select"
            >
              <option value="1">SUCCESSIVE PROCESSING</option>
              <option value="2">SIMULTANEOUS PROCESSING</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="d-flex justify-content-center">
            <Loader />
          </div>
        ) : (
          <div className="row">
            {icons.map((icon, index) => (
              <div className="col-sm-6 col-md-4 col-lg-3 mb-4" key={index}>
                <a
                  href={icon.route}
                  target="_blank"
                  className="card-link"
                  style={{ textDecoration: "none" }}
                >
                  <div
                    className="card"
                    style={{ borderRadius: "30px" }}
                    onClick={() => setGameId(icon.gameId)}
                  >
                    <img
                      src={icon.url}
                      className="card-img-top"
                      alt={icon.name}
                      style={{ padding: "40px" }}
                    />
                    <div
                      className="card-body text-center rounded-bottom-4"
                      style={{ backgroundColor: "rgb(100, 150, 200)" }}
                    >
                      <h5 className="card-title">{icon.name}</h5>
                      <p className="card-text">{icon.description}</p>
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
