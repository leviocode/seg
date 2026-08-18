// import dependencies
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

function EventPartyList() {
  // create the useState
  const [parties, setParty] = useState([]); // state for Invoice list
  const [searchs, setSearch] = useState(""); // state for search
  const [isLoading, setIsLoading] = useState(true); // state for loading
  const [isEmpty, setIsEmpty] = useState(false);

  const { id } = useParams();

  const str = searchs;

  // Split the string into words
  const words = str.split(" ");

  // Capitalize the first letter of each word
  const capitalizedWords = words.map(
    (word) => word.charAt(0).toUpperCase() + word.slice(1),
  );

  // Join the capitalized words back into a string
  const search = capitalizedWords.join(" ");

  // setting up useNavigate
  const navigate = useNavigate();

  // setting up useEffect to do tasks in real-time

  useEffect(() => {
    // create party loader callback function
    const getParty = async () => {
      try {
        if (!search) {
          const url = `https://seg-server.vercel.app/api/parties/event/${id}`; // modify URL based on backend
          const datas = await axios.get(url); // get datas from URL with axios
          datas.data.length === 0 ? setIsEmpty(true) : setIsEmpty(false);
          setParty(datas.data);
          setIsLoading(false);
        } else {
          const url = `https://seg-server.vercel.app/api/parties/event/${id}/key/${search}`; // modify URL based on backend
          const datas = await axios.get(url); // get datas from URL with axios
          datas.data.length === 0 ? setIsEmpty(true) : setIsEmpty(false);
          setParty(datas.data);
          setIsLoading(false);
        }
      } catch (error) {
        window.alert(error.message); // display error message
      }
    }; // dependency array with only `search`

    getParty();
  }, [id, search]); // dependency array with only `getParty`

  const formatDate = (val) => {
    const date = new Date(val);

    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const y = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");

    const exec = `${d}/${m}/${y}, ${hh}:${mm} WIB.`;

    return exec;
  };

  const formatPhone = (val) => {
    // Replace '+62' at the start of the string with '0'
    let cleanedPhone = val.replace(/^(\+62|62|0|\+9)/, "0");

    // Remove any symbols like '-', '+', '/', '\', '#', '$', '!', etc.
    cleanedPhone = cleanedPhone.replace(/[-+\\#$!]/g, "");

    cleanedPhone = cleanedPhone.replace(/\s+/g, "");

    return cleanedPhone;
  };

  const formatWhatsApp = (val) => {
    // Replace '+62' at the start of the string with '0'
    let pH = val.replace(/^(\+62|62|0|\+9)/, "62");

    // Remove any symbols like '-', '+', '/', '\', '#', '$', '!', etc.
    pH = pH.replace(/[-+\\#$!]/g, "");

    pH = pH.replace(/\s+/g, "");

    return pH;
  };

  // FIX: Menggunakan boolean map variables agar pengecekan tabel lebih ringan, efisien, dan tidak menyebabkan kolom hilang massal.
  const showName = parties.some((party) => party.name && party.name !== "");
  const showParent = parties.some(
    (party) => party.parentName && party.parentName !== "",
  );
  const showChild = parties.some(
    (party) => party.childName && party.childName !== "",
  );
  const showCompany = parties.some(
    (party) => party.company && party.company !== "",
  );
  const showSchool = parties.some(
    (party) => party.school && party.school !== "",
  );
  const showJob = parties.some((party) => party.job && party.job !== "");
  const showRoom = parties.some((party) => party.room && party.room !== "");
  const showReferral = parties.some(
    (party) => party.referral && party.referral !== "",
  );
  const showProductOption = parties.some(
    (party) => party.productOption && party.productOption !== "",
  ); // TAMBAHAN INSTRUKSI ATASAN
  const showMethod = parties.some(
    (party) => party.method && party.method !== "",
  );
  const showFile = parties.some((party) => party.file && party.file !== "");

  // render the display
  return (
    <>
      <div className="section headline">
        <h4>Party List</h4>
        <button onClick={() => navigate(`/event-view/${id}`)} className="btn">
          See Event
        </button>
        <div className="section">
          <input
            type="text"
            className="input"
            value={searchs} // set value from search state
            onInput={(e) => setSearch(e.target.value)} // update search state on change
            placeholder="Search Parties..."
          />
        </div>
        <p>Ditemukan: {parties.length} data</p>
      </div>
      {isLoading ? (
        <div className="section">Loading party Database...</div> // display status when loading
      ) : isEmpty ? (
        <div className="section">No data...</div> // display status when loading
      ) : (
        <>
          <div>
            <table className="table frame sit" style={{ overflowX: "scroll" }}>
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Reg. Date</th>
                  {showName && <th>Participant's Name</th>}
                  {showParent && <th>Parent's Name</th>}
                  {showChild && <th>Child's Name</th>}
                  {showCompany && <th>Company</th>}
                  {showSchool && <th>School Name</th>}
                  {showJob && <th>Occupation</th>}
                  {showRoom && <th>Attendance</th>}

                  {/* Kolom Opsi Produk Baru Sesuai Perintah Mrs. Femi */}
                  {showProductOption && <th>Product Option</th>}

                  {showReferral && <th>Referral</th>}
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Address</th>
                  {showMethod && <th>Payment</th>}
                  {showFile && <th>Attachment</th>}
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {parties.map((party, index) => (
                  // table content
                  <tr key={party._id}>
                    <td>{index + 1}</td>
                    <td>{formatDate(party.createdAt)}</td>

                    {showName && <td>{party.name || "-"}</td>}
                    {showParent && <td>{party.parentName || "-"}</td>}
                    {showChild && <td>{party.childName || "-"}</td>}
                    {showCompany && <td>{party.company || "-"}</td>}
                    {showSchool && <td>{party.school || "-"}</td>}
                    {showJob && <td>{party.job || "-"}</td>}
                    {showRoom && <td>{party.room || "-"}</td>}

                    {/* Render data Opsi Produk */}
                    {showProductOption && (
                      <td style={{ fontWeight: "bold", color: "#2c3e50" }}>
                        {party.productOption || "-"}
                      </td>
                    )}

                    {showReferral && <td>{party.referral || "-"}</td>}
                    <td>
                      <a
                        href={`https://wa.me/${formatWhatsApp(party.phone)}`}
                        target="_blank"
                        rel="noreferrer">
                        {formatPhone(party.phone)}
                      </a>
                    </td>
                    <td>
                      <a
                        href={`mailto:${party.email.toLowerCase()}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ textTransform: "lowercase" }}>
                        {party.email}
                      </a>
                    </td>
                    <td>{party.address.toUpperCase()}</td>
                    {showMethod && <td>{party.method || "-"}</td>}
                    {showFile && (
                      <td>
                        {party.file ? (
                          <a
                            href={`${party.file}`}
                            target="_blank"
                            rel="noreferrer">
                            SEE FILE
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                    )}
                    <td>
                      <button
                        onClick={() =>
                          navigate(`/event-join-edit/${party._id}`)
                        }
                        className="btn">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}

export default EventPartyList;
