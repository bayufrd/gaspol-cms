import React, { useState, useEffect } from "react";
import axios from "axios";

export const DetailMenu = ({ show, onClose, selectedMenuId }) => {
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
  const [menuData, setMenuData] = useState(null);
   
  // Ambil data menu berdasarkan selectedMenuId saat modal terbuka
  useEffect(() => {
    const fetchData = async () => {
        if (show && selectedMenuId) {
            try {
                const response = await axios.get(`${apiBaseUrl}/menu/${selectedMenuId}`);
                setMenuData(response.data.data);
            } catch (error) {
                console.error('Error fetching menu:', error);
            }
        }
    }
    fetchData();
  }, [show, selectedMenuId]);   

   // Clear menuData saat modal ditutup
   useEffect(() => {
    if (!show) {
      setMenuData(null);
    }
  }, [show]);

  return (
    <>
      <div
        className={`modal fade text-left ${show ? "show" : ""}`}
        id="inlineForm"
        tabindex="-1"
        role="dialog"
        aria-labelledby="myModalLabel33"
        aria-modal={show ? "true" : undefined}
        aria-hidden={show ? undefined : "true"}
        style={show ? { display: "block" } : { display: "none" }}
      >
        <div
          class="modal-dialog modal-dialog-centered modal-dialog-scrollable"
          role="document"
        >
          <div class="modal-content">
            <div class="modal-header">
              <h4 class="modal-title" id="myModalLabel33">
                Add Menu
              </h4>
              <button
                type="button"
                class="close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={onClose}
              >
                <i data-feather="x"></i>x
              </button>
            </div>
            {menuData ? (
            <div className="modal-body">
              <label>Nama: {menuData.name}</label>
              <label>Tipe Menu: {menuData.menu_type}</label>
              <label>Harga: {menuData.price}</label>
              {/* Tambahkan detail lain yang Anda butuhkan */}
              {menuData.menu_details.map((detail) => (
                <div key={detail.menu_detail_id}>
                  <label>Varian: {detail.varian}</label>
                  <label>Harga Varian: {detail.price}</label>
                  {/* Tambahkan detail varian lain yang Anda butuhkan */}
                </div>
              ))}
            </div>
          ) : (
            <div className="modal-body">
              <p>Loading...</p>
            </div>
          )}
          </div>
        </div>
      </div>
      <div className={show && `modal-backdrop fade show`}></div>
    </>
  );
};
