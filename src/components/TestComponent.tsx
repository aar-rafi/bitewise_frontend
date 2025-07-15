import React, { useState } from 'react';
import { testsApi, TestResponse, TestUpdateRequest } from '@/lib/api';

interface TestComponentProps {
    test: TestResponse;
    onTestUpdated: (updatedTest: TestResponse) => void;
    onTestDeleted: (deletedTestId: number) => void;
}

export const TestComponent: React.FC<TestComponentProps> = ({
    test,
    onTestUpdated,
    onTestDeleted,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<TestUpdateRequest>({
        name: test.name,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleEdit = () => {
        setIsEditing(true);
        setEditData({
            name: test.name,
        });
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditData({
            name: test.name,
        });
    };

    const handleSave = async () => {
        if (!editData.name?.trim()) {
            alert('Name is required');
            return;
        }

        setIsSubmitting(true);
        try {
            const updatedTest = await testsApi.update(test.id, editData);
            onTestUpdated(updatedTest);
            setIsEditing(false);
            alert('Test updated successfully');
        } catch (error) {
            console.error('Error updating test:', error);
            alert('Failed to update test');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this test?')) {
            return;
        }

        try {
            await testsApi.delete(test.id);
            onTestDeleted(test.id);
            alert('Test deleted successfully');
        } catch (error) {
            console.error('Error deleting test:', error);
            alert('Failed to delete test');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <div style={{ 
            border: '1px solid #ddd', 
            borderRadius: '8px', 
            padding: '16px', 
            marginBottom: '16px',
            backgroundColor: '#f9f9f9'
        }}>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '16px'
            }}>
                <div>
                    <h3 style={{ 
                        margin: '0 0 8px 0', 
                        fontSize: '18px', 
                        fontWeight: 'bold',
                        color: '#333'
                    }}>
                        Test ID: {test.id}
                    </h3>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {!isEditing && (
                        <>
                            <button
                                onClick={handleEdit}
                                style={{
                                    padding: '6px 12px',
                                    backgroundColor: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                Edit
                            </button>
                            <button
                                onClick={handleDelete}
                                style={{
                                    padding: '6px 12px',
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                Delete
                            </button>
                        </>
                    )}
                </div>
            </div>

            {isEditing ? (
                <div style={{ marginBottom: '16px' }}>
                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '4px', 
                            fontWeight: 'bold',
                            fontSize: '14px'
                        }}>
                            Name
                        </label>
                        <input
                            type="text"
                            value={editData.name || ''}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            placeholder="Test name..."
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
            ) : (
                <div style={{ marginBottom: '16px' }}>
                    <div style={{ marginBottom: '12px' }}>
                        <strong style={{ fontSize: '14px' }}>Name:</strong>
                        <p style={{ 
                            margin: '4px 0',
                            padding: '8px',
                            backgroundColor: '#fff',
                            border: '1px solid #eee',
                            borderRadius: '4px',
                            fontSize: '14px'
                        }}>
                            {test.name}
                        </p>
                    </div>

                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr', 
                        gap: '16px',
                        fontSize: '12px',
                        color: '#666'
                    }}>
                        <div>
                            <strong>Created:</strong> {formatDate(test.created_at)}
                        </div>
                        <div>
                            <strong>Updated:</strong> {formatDate(test.updated_at)}
                        </div>
                    </div>
                </div>
            )}

            {isEditing && (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={handleSave}
                        disabled={isSubmitting}
                        style={{
                            flex: 1,
                            padding: '8px 16px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            opacity: isSubmitting ? 0.6 : 1
                        }}
                    >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                        onClick={handleCancel}
                        style={{
                            flex: 1,
                            padding: '8px 16px',
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
            )}
        </div>
    );
};