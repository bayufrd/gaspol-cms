import React, { useState, useEffect } from "react";
import axios from "axios";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

const Report = ({ userTokenData }) => {
  const [reports, setReports] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    getReports();
  }, []);

  const getReports = async () => {
    const response = await axios.get(`${apiBaseUrl}/report`, {
      params: {
        outlet_id: userTokenData.outlet_id,
      },
    });
    setReports(response.data.data);
  };

  return (
    <div>
      <div className="page-heading">
        <div className="page-title">
          <div className="row">
            <div className="col-12 col-md-6 order-md-1 order-last mb-3">
              <h3>Laporan</h3>
            </div>
          </div>
        </div>
        <section class="section">
          <div class="card">
            <div class="card-header">
              <div className="float-lg-start">
                <div className="card-header-report">
                  <div className="button btn btn-primary rounded-pill">
                    <i class="bi bi-search"></i> Cari
                  </div>
                  <div>
                    <input
                      type="text"
                      id="startDateInput"
                      className={`form-control`}
                      placeholder="Tanggal mulai"
                      value={startDate || ""}
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      id="startDateInput"
                      className={`form-control`}
                      placeholder="Tanggal akhir"
                      value={endDate || ""}
                    />
                  </div>
                  <div class="form-check">
                    <div class="checkbox">
                      <input
                        type="checkbox"
                        class="form-check-input"
                      />
                      <label for="checkbox2">Transaksi Sukses </label>
                    </div>
                  </div>
                  <div class="form-check">
                    <div class="checkbox">
                      <input
                        type="checkbox"
                        class="form-check-input"
                      />
                      <label for="checkbox2">Transaksi Pending </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="card-body">
              <table class="table table-striped" id="table1">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Receipt Number</th>
                    <th>Customer Name</th>
                    <th>Customer Seat</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report, index) => (
                    <tr key={report.id}>
                      <td>{index + 1}</td>
                      <td>{report.receipt_number}</td>
                      <td>{report.customer_name}</td>
                      <td>{report.customer_seat}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Report;
