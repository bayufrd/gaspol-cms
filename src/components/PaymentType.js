import React, { useState, useEffect } from "react";
import axios from "axios";
import { PaymentTypeModal } from "./PaymentTypeModal";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

const PaymentType = ({ userTokenData }) => {
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [paymentCategories, setPaymentCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPaymentTypeId, setSelectedPaymentTypeId] = useState(null);
  const [isOrderChanged, setIsOrderChanged] = useState(false); // Track order change
  const [dragMode, setDragMode] = useState(false); // Track if drag mode is active

  useEffect(() => {
    getPaymentTypes();
  }, []);

  const getPaymentTypes = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/payment-management`, {
        params: {
          outlet_id: userTokenData.outlet_id,
        },
      });
      // Sort the payment types based on the 'order' field from the API response
      const sortedPaymentTypes = response.data.data.payment_type.sort(
        (a, b) => a.order - b.order
      );
  
      setPaymentTypes(sortedPaymentTypes);
      setPaymentCategories(response.data.data.payment_categories);
    } catch (error) {
      console.error("Error fetching payment types:", error);
    }
  };

  const openModal = (paymentType) => {
    setSelectedPaymentTypeId(paymentType);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleSavePaymentType = async (newPaymentType) => {
    setPaymentTypes([...paymentTypes, newPaymentType]);
    closeModal();

    try {
      await getPaymentTypes();
    } catch (error) {
      console.error("Error fetching payment types:", error);
    }
  };

  const handleDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return; // If dropped outside the list, do nothing

    // Reorder the list
    const reorderedPaymentTypes = Array.from(paymentTypes);
    const [removed] = reorderedPaymentTypes.splice(source.index, 1);
    reorderedPaymentTypes.splice(destination.index, 0, removed);

    setPaymentTypes(reorderedPaymentTypes);
    setIsOrderChanged(true); // Mark that the order has changed
  };

  const saveOrderChanges = async () => {
    try {
      const updatedOrder = paymentTypes.map((paymentType, index) => ({
        id: paymentType.id,
        order: index + 1, // 1-based index for order
      }));

      // Make an API request to update the order in the database
      await axios.put(`${apiBaseUrl}/update-payment-order`, {
        paymentTypesOrder: updatedOrder,
      });

      setIsOrderChanged(false); // Reset the order change state after saving
      setDragMode(false); // Disable drag mode after saving
    } catch (error) {
      console.error("Error saving order changes:", error);
    }
  };

  return (
    <div>
      <div className="page-heading">
        <div className="page-title">
          <div className="row">
            <div className="col-12 col-md-6 order-md-1 order-last mb-3">
              <h3>Management Payment Types</h3>
            </div>
          </div>
        </div>
      </div>
      <section className="section">
        <div className="card">
          <div className="card-header">
            <div className="float-lg-end">
              <div
                className="button btn btn-primary rounded-pill"
                onClick={() => openModal(null)}
              >
                <i className="bi bi-plus"></i> Tambah Data
              </div>
            </div>
            {/* Button to activate drag mode */}
            <div className="float-lg-end">
              <button
                className="btn btn-secondary rounded-pill"
                onClick={() => setDragMode(!dragMode)}
              >
                {dragMode ? "Cancel Ubah Urutan" : "Ubah Urutan"}
              </button>
            </div>
          </div>
          <div className="card-body">
            {/* Render table with or without drag-and-drop functionality */}
            {paymentTypes.length > 0 && (
              <DragDropContext onDragEnd={handleDragEnd}>
                {dragMode ? (
                  <Droppable droppableId="paymentTypes">
                    {(provided) => (
                      <table
                        className="table table-striped"
                        ref={provided.innerRef} // Apply ref to the table element
                        {...provided.droppableProps} // Spread droppableProps to the table
                      >
                        <thead>
                          <tr>
                            <th>No</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Active</th>
                            <th>Actions</th>
                            <th>Drag</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paymentTypes.map((paymentType, index) => (
                            <Draggable
                              key={paymentType.id}
                              draggableId={paymentType.id.toString()}
                              index={index}
                            >
                              {(provided) => (
                                <tr
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <td>{index + 1}</td>
                                  <td>{paymentType.name}</td>
                                  <td>{paymentType.payment_category_name}</td>
                                  <td>
                                    {paymentType.is_active === 1 ? "Ya" : "Tidak"}
                                  </td>
                                  <td>
                                    <div className="action-buttons">
                                      <div
                                        className="buttons btn info btn-primary"
                                        onClick={() => openModal(paymentType.id)}
                                      >
                                        <i className="bi bi-pencil"></i>
                                      </div>
                                    </div>
                                  </td>
                                  <td
                                    {...provided.dragHandleProps}
                                    className="drag-handle"
                                    style={{
                                      cursor: "grab",
                                      padding: "0 10px",
                                      textAlign: "center",
                                    }}
                                  >
                                    <i className="bi bi-list" />
                                  </td>
                                </tr>
                              )}
                            </Draggable>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </Droppable>
                ) : (
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Active</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentTypes.map((paymentType, index) => (
                        <tr key={paymentType.id}>
                          <td>{index + 1}</td>
                          <td>{paymentType.name}</td>
                          <td>{paymentType.payment_category_name}</td>
                          <td>
                            {paymentType.is_active === 1 ? "Ya" : "Tidak"}
                          </td>
                          <td>
                            <div className="action-buttons">
                              <div
                                className="buttons btn info btn-primary"
                                onClick={() => openModal(paymentType.id)}
                              >
                                <i className="bi bi-pencil"></i>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </DragDropContext>
            )}
            {/* Show save button when the order is changed */}
            {isOrderChanged && (
              <div className="text-end mt-3">
                <button
                  className="btn btn-success"
                  onClick={saveOrderChanges}
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <PaymentTypeModal
        show={showModal}
        onClose={closeModal}
        onSave={handleSavePaymentType}
        selectedPaymentTypeId={selectedPaymentTypeId}
        getPaymentTypes={getPaymentTypes}
        userTokenData={userTokenData}
        paymentCategories={paymentCategories}
      />
    </div>
  );
};

export default PaymentType;
