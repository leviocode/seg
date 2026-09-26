import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

function EventPartyEdit() {
  const { id } = useParams();

  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // State mencegah double submit

  const [eventData, setEventData] = useState({});

  const handleFile = (event) => {
    // Pengecekan file undefined jika user klik cancel di dialog file
    if (event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      // Access the filename from the selected file
      const fileDir = "https://compasspubindonesia.com/media/api/events/img/";
      const file = event.target.files[0];
      const filename = file.name !== "" ? fileDir + file.name : eventData.img;
      setEventData({
        ...eventData,
        img: filename,
      });
    }
  };

  // Setting up useNavigate
  const navigate = useNavigate();

  const handleChange = (event) => {
    // For non-file inputs, set the value directly
    setEventData({
      ...eventData,
      [event.target.name]: event.target.value,
    });
  };

  const AddEvent = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Mulai proses loading

    const cleanedData = {
      ...eventData,
    };

    const formData = new FormData();
    if (selectedFile) {
      formData.append("img", selectedFile);
    }

    try {
      // Add the Event into database with axios
      await axios.patch(
        `https://seg-server.vercel.app/api/parties/id/${id}`,
        cleanedData,
      );

      if (selectedFile) {
        await axios.post(
          `https://compasspubindonesia.com/media/api/bills/index.php`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        );
      }

      // Navigate to main page
      navigate(`/event-join-list/` + eventData.event);
    } catch (error) {
      window.alert(error.message); // Display error messages
      setIsSubmitting(false); // Matikan loading jika error
    }
  };

  // create Event deleter function
  const delEvent = async () => {
    if (window.confirm("Delete this?")) {
      setIsSubmitting(true); // Mulai proses loading hapus
      try {
        await axios.delete(
          `https://seg-server.vercel.app/api/parties/id/${id}`,
        ); // modify URL based on backend
        // navigate to main page
        navigate(`/event-join-list/` + eventData.event);
      } catch (error) {
        window.alert(error.message); // display error message
        setIsSubmitting(false);
      }
    }
  };

  useEffect(() => {
    // create party loader callback function
    const getEvent = async () => {
      try {
        const url = `https://seg-server.vercel.app/api/parties/id/${id}`; // modify URL based on backend
        const datas = await axios.get(url); // get datas from URL with axios

        setEventData(datas.data);
      } catch (error) {
        window.alert(error.message); // display error message
      }
    };

    getEvent(); // dependency array with only `search`
  }, [id]); // dependency array with only `getParty`

  return (
    <>
      <div className="section">
        <div className="section headline">
          {/* Perbaikan: Mengubah judul agar sesuai konteks halamannya */}
          <h4>Edit Participant</h4>
          <button onClick={() => navigate(`/events`)} className="btn">
            See All Events
          </button>
        </div>
        <div className="section">
          <form onSubmit={AddEvent} className="form">
            <div className="field">
              <label className="label">Name</label>
              <input
                type="text"
                className="input"
                id="name"
                name="name"
                value={eventData.name || ""}
                onChange={handleChange}
                placeholder="Name"
              />
            </div>
            <div className="field">
              <label className="label">Parent Name</label>
              <input
                type="text"
                className="input"
                id="parentName"
                name="parentName"
                value={eventData.parentName || ""}
                onChange={handleChange}
                placeholder="Parent Name"
              />
            </div>
            <div className="field">
              <label className="label">Child Name</label>
              <input
                type="text"
                className="input"
                id="childName"
                name="childName"
                value={eventData.childName || ""}
                onChange={handleChange}
                placeholder="Child Name"
              />
            </div>

            {/* Perbaikan: Menambahkan Product Option untuk menampung data kategori/lomba */}
            <div className="field">
              <label className="label">
                Product Option / Kategori (Khusus Lomba/Beli)
              </label>
              <input
                type="text"
                className="input"
                id="productOption"
                name="productOption"
                value={eventData.productOption || ""}
                onChange={handleChange}
                placeholder="Contoh: Lomba Mewarnai / Produk A"
              />
            </div>

            <div className="field">
              <label className="label">Occupation</label>
              <select
                id="job"
                name="job"
                value={eventData.job || ""}
                onChange={handleChange}>
                <option value="">--- Select Occupation ---</option>
                <option value="Headmaster">Headmaster</option>
                <option value="Teacher">Teacher</option>
                <option value="Tutor">Tutor</option>
                <option value="Parent">Parent</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="field">
              <label className="label">Company/Agency</label>
              <input
                type="text"
                className="input"
                id="company"
                name="company"
                value={eventData.company || ""}
                onChange={handleChange}
                placeholder="Company/Agency"
              />
            </div>
            <div className="field">
              <label className="label">School</label>
              <input
                type="text"
                className="input"
                id="school"
                name="school"
                value={eventData.school || ""}
                onChange={handleChange}
                placeholder="School Name"
              />
            </div>
            <div className="field">
              <label className="label">Email</label>
              <input
                type="text"
                className="input"
                id="email"
                name="email"
                value={eventData.email || ""}
                onChange={handleChange}
                placeholder="Email"
              />
            </div>
            <div className="field">
              <label className="label">Phone</label>
              <input
                type="text"
                className="input"
                id="phone"
                name="phone"
                value={eventData.phone || ""}
                onChange={handleChange}
                placeholder="Phone"
              />
            </div>
            <div className="field">
              <label className="label">Attendance | Kehadiran</label>
              <select
                id="room"
                name="room"
                value={eventData.room || ""}
                onChange={handleChange}>
                <option value="">
                  --- Select Attendance | Pilih Kehadiran ---
                </option>
                <option value="Online">Online | Daring</option>
                <option value="Onsite">Onsite | Luring</option>
              </select>
            </div>
            <div className="field">
              <label className="label">City</label>
              <input
                type="text"
                className="input"
                id="address"
                name="address"
                value={eventData.address || ""}
                onChange={handleChange}
                placeholder="City"
              />
            </div>
            <div className="field">
              <label className="label">Referral</label>
              <input
                type="text"
                className="input"
                id="referral"
                name="referral"
                value={eventData.referral || ""}
                onChange={handleChange}
                placeholder="Referral"
              />
            </div>

            {/* Perbaikan: Menambahkan Payment Method */}
            <div className="field">
              <label className="label">Payment Method</label>
              <input
                type="text"
                className="input"
                id="method"
                name="method"
                value={eventData.method || ""}
                onChange={handleChange}
                placeholder="Payment Method"
              />
            </div>

            <div className="field">
              <label className="label">Attachment</label>
              <input
                type="file"
                className="input"
                id="img"
                name="img"
                onChange={handleFile}
                placeholder="Event Image"
              />
              {eventData.img && (
                <p style={{ fontSize: "12px", marginTop: "5px" }}>
                  Current: {eventData.img.split("/").pop()}
                </p>
              )}
            </div>
            <div className="section">
              <div className="controls">
                <button
                  type="button"
                  onClick={delEvent}
                  className="btn"
                  disabled={isSubmitting}>
                  Delete
                </button>
                <button type="submit" className="btn" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default EventPartyEdit;
