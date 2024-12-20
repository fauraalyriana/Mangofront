import React, { useState, useEffect } from "react";
import { Container, Row, Col, Alert, Spinner, Image, Button } from "react-bootstrap";
import axios from "axios";
import NavBar from "../../components/layout/navbar/navbar";

const HistoryDetection = () => {
    const [history, setHistory] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = localStorage.getItem("token");
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };

                const response = await axios.get("http://34.101.214.48:3000/history", config);

                if (response.data.status === "success") {
                    const sortedData = response.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    setHistory(sortedData);
                } else {
                    setError("Failed to fetch detection history. Please try again.");
                }
            } catch (err) {
                console.error("Error fetching history:", err);
                setError("An error occurred while fetching detection history.");
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        if (isNaN(date)) return "Invalid Date";
        return date.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const handleNextPage = () => {
        if (currentPage < Math.ceil(history.length / itemsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = history.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div>
            <NavBar></NavBar>

            <Container className="py-5">
                <Row className="mb-4">
                    <Col>
                        <h2 className="text-center">Your Detection History</h2>
                    </Col>
                </Row>

                {loading ? (
                    <Row>
                        <Col className="text-center">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                            <p className="mt-3">Loading detection history...</p>
                        </Col>
                    </Row>
                ) : error ? (
                    <Row>
                        <Col>
                            <Alert variant="danger">{error}</Alert>
                        </Col>
                    </Row>
                ) : history.length === 0 ? (
                    <Row>
                        <Col>
                            <Alert variant="info">No detection history found.</Alert>
                        </Col>
                    </Row>
                ) : (
                    <>
                        <Row>
                            {currentItems.map((entry, index) => (
                                <Col md={6} key={entry.id} className="mb-4">
                                    <Alert variant="light" className="shadow-sm">
                                        <h5 className="font-weight-bold">History #{indexOfFirstItem + index + 1}</h5>
                                        {entry.imageUrl && (
                                            <div className="text-center mb-3">
                                                <Image
                                                    src={entry.imageUrl}
                                                    alt={`Mango Detection ${index + 1}`}
                                                    fluid
                                                    rounded
                                                />
                                            </div>
                                        )}
                                        <p><strong>Result:</strong> {entry.result}</p>
                                        <p><strong>Suggestion:</strong> {entry.suggestion}</p>
                                        <p><strong>Date:</strong> {formatDate(entry.createdAt)}</p>
                                    </Alert>
                                </Col>
                            ))}
                        </Row>
                        <Row className="mt-4">
                            <Col className="text-center">
                                <Button
                                    variant="primary"
                                    className="me-2"
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleNextPage}
                                    disabled={currentPage === Math.ceil(history.length / itemsPerPage)}
                                >
                                    Next
                                </Button>
                            </Col>
                        </Row>
                    </>
                )}
            </Container>
        </div>
    );
};

export default HistoryDetection;
