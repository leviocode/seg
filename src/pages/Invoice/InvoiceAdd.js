import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

function InvoiceAdd() {
  const [books, setBooks] = useState([]);
  const [currentCount, setCurrentCount] = useState(0);
  const [invoiceData, setInvoiceData] = useState({
    date: "",
    name: "",
    company: "",
    email: "",
    phone: "",
    address: "",
    sales: "",
    bookList: [],
    serie: "",
  });

  const generateSerie = (count) => {
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear().toString().slice(-2);
    const formattedMonth = month.toString().padStart(2, "0");
    return `COM${count + 1 + 100}${formattedMonth}${year}`;
  };

  const handleReset = () => {
    setInvoiceData({
      date: "",
      name: "",
      company: "",
      email: "",
      phone: "",
      address: "",
      sales: "",
      bookList: [],
      serie: generateSerie(currentCount),
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== "string" || !dateStr.includes("/")) {
      return dateStr;
    }
    const parts = dateStr.split("/");
    if (parts.length !== 3) return dateStr;

    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  };

  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setInvoiceData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBookChange = (index) => (event) => {
    const { name, value } = event.target;

    // Fixed: Disconnect dropdown from the manual ISBN text input
    if (name === "bookDropdown") {
      const selectedBook = books.find((book) => book.isbn === value);

      if (!value || value === "-") {
        setInvoiceData((prev) => ({
          ...prev,
          bookList: prev.bookList.map((book, i) =>
            index === i ? { ...book, isManual: true } : book,
          ),
        }));
      } else if (selectedBook) {
        setInvoiceData((prev) => ({
          ...prev,
          bookList: prev.bookList.map((book, i) =>
            index === i
              ? {
                  ...book,
                  bookName: selectedBook.name,
                  isbn: selectedBook.isbn,
                  price: selectedBook.bookPrice,
                  isManual: false,
                }
              : book,
          ),
        }));
      }
    } else {
      setInvoiceData((prev) => ({
        ...prev,
        bookList: prev.bookList.map((book, i) =>
          index === i ? { ...book, [name]: value } : book,
        ),
      }));
    }
  };

  const handleAddBook = (e) => {
    e.preventDefault();
    setInvoiceData((prev) => ({
      ...prev,
      bookList: [
        ...prev.bookList,
        {
          bookName: "",
          isbn: "",
          price: "",
          qty: "",
          disc: "",
          isManual: false,
        },
      ],
    }));
  };

  const handleRemoveBook = (e) => {
    e.preventDefault();
    setInvoiceData((prev) => ({
      ...prev,
      bookList: prev.bookList.slice(0, -1),
    }));
  };

  const findBooks = (value, sample) => {
    const coded = String(value);
    const bookir = sample.find((book) => book.isbn === coded);
    return bookir?.name;
  };

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: "",
        });

        if (jsonData.length < 24) {
          throw new Error(
            "The Excel file doesn't match the expected format. Please use the correct template.",
          );
        }

        const getCellValue = (row, col) => jsonData[row]?.[col] || "";

        const customerName = getCellValue(6, 1);
        const invoiceNumber = getCellValue(4, 4);
        const invoiceDate = getCellValue(4, 6);
        const companyAddress = getCellValue(6, 3);
        const email = getCellValue(9, 1);
        const phone = getCellValue(11, 1);

        const bookList = [];
        let row = 17;
        while (true) {
          const hasGrandTotal = jsonData[row]?.some((cell) =>
            String(cell).includes("Grand Total (Rp.)"),
          );

          if (hasGrandTotal) break;

          const rawIsbn = getCellValue(row, 2);
          const isbnBook = !rawIsbn || rawIsbn === "-" ? "-" : String(rawIsbn);
          const qty = getCellValue(row, 3);
          const price = getCellValue(row, 4);
          const disc = getCellValue(row, 5);

          if (qty !== "" && price !== "") {
            const bookName =
              isbnBook === "-"
                ? getCellValue(row, 1)
                : findBooks(isbnBook, books);

            bookList.push({
              bookName,
              isbn: isbnBook,
              qty: qty,
              price: price,
              disc: disc ? (parseFloat(disc) * 100).toString() : "",
              isManual: isbnBook === "-",
            });
          }
          row++;
        }

        // Fixed: Use safe XLSX Date Parsing to prevent Timezone shift errors
        let formattedInvoiceDate = invoiceDate;
        if (typeof invoiceDate === "number") {
          const parsedDate = XLSX.SSF.parse_date_code(invoiceDate);
          const day = String(parsedDate.d).padStart(2, "0");
          const month = String(parsedDate.m).padStart(2, "0");
          const year = parsedDate.y;
          formattedInvoiceDate = `${day}/${month}/${year}`;
        }

        setInvoiceData((prev) => ({
          ...prev,
          serie: invoiceNumber,
          date: formattedInvoiceDate,
          name: customerName.split("-")[0]?.trim() || "",
          company: customerName.split("-")[1]?.trim() || "",
          email: email,
          phone: phone,
          address: companyAddress,
          bookList: bookList,
        }));
      } catch (error) {
        console.error("Excel Import Error:", error);
        alert(
          `Import failed: ${error.message}\n\nPlease ensure you're using the correct template.`,
        );
      }
    };

    reader.onerror = () => {
      alert("Error reading file. Please try again.");
    };

    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  const AddInvoice = async (e) => {
    e.preventDefault();
    try {
      const formatDated = formatDate(invoiceData.date);

      const cleanedData = {
        ...invoiceData,
        date: formatDated,
        bookList: invoiceData.bookList.filter(Boolean),
      };

      await axios.post(
        `https://seg-server.vercel.app/api/Invoices`,
        cleanedData,
      );

      navigate(`/invoices`);
    } catch (error) {
      window.alert(error.message);
    }
  };

  useEffect(() => {
    const fetchLatestCount = async () => {
      try {
        const url = `https://seg-server.vercel.app/api/invoices`;
        const datas = await axios.get(url);

        // Fixed: Check both month AND year so it doesn't count old years
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const res = datas.data;
        const filtered = res.filter((re) => {
          const dates = new Date(re.date);
          return (
            dates.getMonth() === currentMonth &&
            dates.getFullYear() === currentYear
          );
        });
        const count = filtered.length;

        setCurrentCount(count);
        const serie = generateSerie(count);

        setInvoiceData((prevData) => ({
          ...prevData,
          serie: serie,
        }));
      } catch (error) {
        console.error("Error fetching latest invoice count:", error);
      }
    };
    fetchLatestCount();

    const getBooks = async () => {
      try {
        const url = `https://seg-server.vercel.app/api/books`;
        const datas = await axios.get(url);
        setBooks(datas.data);
      } catch (error) {
        window.alert(error.message);
      }
    };

    getBooks();
  }, []);

  return (
    <div className="section">
      <div className="section headline">
        <h4>Add Invoice</h4>
        <div>
          <button onClick={() => navigate(`/invoices`)} className="btn">
            See All Invoices
          </button>
        </div>
      </div>
      <div className="section">
        <form onSubmit={AddInvoice} className="form">
          <div className="field">
            <label className="label">Import Xlsx</label>
            <input
              id="file-upload"
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileImport}
            />
          </div>
          <div className="field">
            <label className="label">No.</label>
            {/* Fixed: Removed readOnly so it is editable */}
            <input
              type="text"
              className="input"
              id="serie"
              name="serie"
              value={invoiceData.serie}
              onChange={handleChange}
              placeholder="No."
            />
          </div>
          <div className="field">
            <label className="label">Date</label>
            <input
              type="text"
              className="input"
              id="date"
              name="date"
              value={invoiceData.date}
              onChange={handleChange}
              placeholder="dd/mm/yyyy"
              required
            />
          </div>
          <div className="field">
            <label className="label">PIC Name</label>
            <input
              type="text"
              className="input"
              id="name"
              name="name"
              value={invoiceData.name}
              onChange={handleChange}
              placeholder="PIC Name"
            />
          </div>
          <div className="field">
            <label className="label">Company</label>
            <input
              type="text"
              className="input"
              id="company"
              name="company"
              value={invoiceData.company}
              onChange={handleChange}
              placeholder="Company"
            />
          </div>
          <div className="field">
            <label className="label">Email</label>
            <input
              type="text"
              className="input"
              id="email"
              name="email"
              value={invoiceData.email}
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
              value={invoiceData.phone}
              onChange={handleChange}
              placeholder="Phone"
            />
          </div>
          <div className="field">
            <label className="label">Address</label>
            <input
              type="text"
              className="input"
              id="address"
              name="address"
              value={invoiceData.address}
              onChange={handleChange}
              placeholder="Address"
            />
          </div>
          <div className="field">
            <label className="label">Sales Name</label>
            <input
              type="text"
              className="input"
              id="sales"
              name="sales"
              value={invoiceData.sales}
              onChange={handleChange}
              placeholder="Sales Name"
            />
          </div>

          {invoiceData.bookList.map((book, index) => (
            <div className="section" key={index}>
              <div className="section">
                <h4 className="label">Book {index + 1}</h4>
              </div>
              <div className="field">
                <label className="label">Book Name</label>
                {/* Fixed: Renamed to bookDropdown */}
                <select
                  type="text"
                  name={`bookDropdown`}
                  value={book.isbn || ""}
                  onChange={handleBookChange(index)}
                  style={{ display: book.isManual ? "none" : "block" }}>
                  <option value="">--- Select Book ---</option>
                  <option value="-">{book.bookName || "Manual Entry"}</option>
                  {books.map((item, i) => (
                    <option key={i} value={item.isbn}>
                      {item.name}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  className="input"
                  name="bookName"
                  value={book.bookName}
                  onChange={handleBookChange(index)}
                  placeholder="Manual Book Name"
                  style={{ display: book.isManual ? "block" : "none" }}
                />
              </div>

              {book.isManual && (
                <button
                  type="button"
                  onClick={() =>
                    handleBookChange(index)({
                      target: { name: "bookDropdown", value: "" },
                    })
                  }>
                  Select from List Instead
                </button>
              )}

              <div className="field">
                <label className="label">ISBN</label>
                <input
                  type="text"
                  name={`isbn`}
                  value={book.isbn}
                  onChange={handleBookChange(index)}
                  placeholder={`ISBN`}
                />
              </div>
              <div className="field">
                <label className="label">Price</label>
                <input
                  type="text"
                  name={`price`}
                  value={book.price}
                  onChange={handleBookChange(index)}
                  placeholder={`Price`}
                />
              </div>
              <div className="field">
                <label className="label">Quantity</label>
                <input
                  type="text"
                  className="input"
                  name={`qty`}
                  value={book.qty}
                  onChange={handleBookChange(index)}
                  placeholder={`Quantity`}
                />
              </div>
              <div className="field">
                <label className="label">Discount</label>
                <input
                  type="text"
                  className="input"
                  name={`disc`}
                  value={book.disc}
                  onChange={handleBookChange(index)}
                  placeholder={`Discount`}
                />
              </div>
            </div>
          ))}

          <div className="section">
            <div className="controls">
              <button type="button" className="btn" onClick={handleRemoveBook}>
                Remove Book
              </button>
              <button type="button" className="btn" onClick={handleAddBook}>
                Add Book
              </button>
              <button type="button" className="btn" onClick={handleReset}>
                Reset
              </button>
              <button type="submit" className="btn">
                Create
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InvoiceAdd;
