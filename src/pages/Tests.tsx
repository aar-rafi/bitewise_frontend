import React, { useState, useEffect } from 'react';
import { testsApi, TestResponse, TestFilterParams, TestListResponse, TestCreateRequest, TestItem } from '@/lib/api';
import { TestComponent } from '@/components/TestComponent';

export default function Tests() {
    const [tests, setTests] = useState<TestItem[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');

    // Create form state
    const [newTestName, setNewTestName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const pageSize = 20;

    useEffect(() => {
        loadTests();
    }, [currentPage]);

    const loadTests = async () => {
        setIsLoading(true);
        try {
            let response: TestListResponse;
            
            const hasFilters = searchTerm.trim();

            if (hasFilters) {
                const filters: TestFilterParams = {};
                if (searchTerm) filters.search = searchTerm;

                // response = await testsApi.filter(filters, currentPage, pageSize);
                response = await testsApi.getAll(currentPage, pageSize);
            } else {
                response = await testsApi.getAll(currentPage, pageSize);
            }

            setTests(response.tests);
            setTotalPages(response.total_pages);
            setTotalCount(response.total_count);
        } catch (error) {
            console.error('Error loading tests:', error);
            alert('Failed to load tests');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = () => {
        setCurrentPage(1);
        loadTests();
    };

    const clearFilters = () => {
        setSearchTerm('');
        setCurrentPage(1);
        loadTests();
    };

    const handleCreateTest = async () => {
        if (!newTestName.trim()) {
            alert('Test name is required');
            return;
        }

        setIsCreating(true);
        try {
            const createData: TestCreateRequest = {
                name: newTestName.trim()
            };
            
            const newTest = await testsApi.create(createData);
            
            // Add new test to the beginning of the list
            setTests(prev => [newTest, ...prev]);
            setTotalCount(prev => prev + 1);
            
            // Reset form
            setNewTestName('');
            setShowCreateForm(false);
            
            alert('Test created successfully');
        } catch (error) {
            console.error('Error creating test:', error);
            alert('Failed to create test');
        } finally {
            setIsCreating(false);
        }
    };

    const handleTestUpdated = (updatedTest: TestResponse) => {
        setTests(prev => prev.map(test => 
            test.id === updatedTest.id ? updatedTest : test
        ));
    };

    const handleTestDeleted = (deletedTestId: number) => {
        setTests(prev => prev.filter(test => test.id !== deletedTestId));
        setTotalCount(prev => prev - 1);
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const getFilterCount = () => {
        let count = 0;
        if (searchTerm) count++;
        return count;
    };

    return (
        <div style={{ 
            maxWidth: '1200px', 
            margin: '0 auto', 
            padding: '24px',
            fontFamily: 'Arial, sans-serif'
        }}>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '24px'
            }}>
                <div>
                    <h1 style={{ 
                        fontSize: '32px', 
                        fontWeight: 'bold', 
                        margin: '0 0 8px 0',
                        color: '#333'
                    }}>
                        Tests
                    </h1>
                    <p style={{ 
                        color: '#666', 
                        margin: 0,
                        fontSize: '16px'
                    }}>
                        View and manage all test records
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold'
                    }}
                >
                    {showCreateForm ? 'Cancel' : 'Create New Test'}
                </button>
            </div>

            {/* Create Form */}
            {showCreateForm && (
                <div style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '20px',
                    marginBottom: '24px',
                    backgroundColor: '#f8f9fa'
                }}>
                    <h3 style={{ 
                        margin: '0 0 16px 0', 
                        fontSize: '20px',
                        color: '#333'
                    }}>
                        Create New Test
                    </h3>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontWeight: 'bold',
                            fontSize: '14px'
                        }}>
                            Test Name
                        </label>
                        <input
                            type="text"
                            value={newTestName}
                            onChange={(e) => setNewTestName(e.target.value)}
                            placeholder="Enter test name..."
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '16px',
                                maxWidth: '400px'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={handleCreateTest}
                            disabled={isCreating}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: isCreating ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                opacity: isCreating ? 0.6 : 1
                            }}
                        >
                            {isCreating ? 'Creating...' : 'Create Test'}
                        </button>
                        <button
                            onClick={() => {
                                setShowCreateForm(false);
                                setNewTestName('');
                            }}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#6c757d',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '24px',
                backgroundColor: '#fff'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px'
                }}>
                    <h3 style={{ 
                        margin: 0, 
                        fontSize: '18px',
                        color: '#333'
                    }}>
                        Filters
                    </h3>
                    {getFilterCount() > 0 && (
                        <span style={{
                            backgroundColor: '#e9ecef',
                            color: '#495057',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                        }}>
                            {getFilterCount()} filter{getFilterCount() !== 1 ? 's' : ''} active
                        </span>
                    )}
                </div>
                
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '16px',
                    marginBottom: '16px'
                }}>
                    {/* Search */}
                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontWeight: 'bold',
                            fontSize: '14px'
                        }}>
                            Search Name
                        </label>
                        <input
                            type="text"
                            placeholder="Search in test names..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '14px'
                            }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={handleSearch}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        Apply Filters
                    </button>
                    <button
                        onClick={clearFilters}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: 'transparent',
                            color: '#007bff',
                            border: '1px solid #007bff',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Results */}
            <div style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: '#fff'
            }}>
                <h3 style={{
                    margin: '0 0 20px 0',
                    fontSize: '18px',
                    color: '#333'
                }}>
                    Tests ({totalCount} total)
                </h3>
                
                {isLoading ? (
                    <div style={{ 
                        textAlign: 'center', 
                        padding: '40px',
                        fontSize: '16px',
                        color: '#666'
                    }}>
                        Loading tests...
                    </div>
                ) : tests.length === 0 ? (
                    <div style={{ 
                        textAlign: 'center', 
                        padding: '40px',
                        fontSize: '16px',
                        color: '#666'
                    }}>
                        No tests found. Try adjusting your filters or create a new test.
                    </div>
                ) : (
                    <div>
                        {tests.map((test) => (
                            <TestComponent
                                key={test.id}
                                test={test}
                                onTestUpdated={handleTestUpdated}
                                onTestDeleted={handleTestDeleted}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '12px',
                        marginTop: '24px'
                    }}>
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: currentPage === 1 ? '#e9ecef' : '#007bff',
                                color: currentPage === 1 ? '#6c757d' : 'white',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            Previous
                        </button>
                        <span style={{
                            fontSize: '14px',
                            color: '#666'
                        }}>
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: currentPage === totalPages ? '#e9ecef' : '#007bff',
                                color: currentPage === totalPages ? '#6c757d' : 'white',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}