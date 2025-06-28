const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

async function testSubtaskCreation() {
    console.log('🧪 Testing subtask creation...');
    
    // Create a test file
    const testFileContent = 'This is a test file for subtask creation';
    fs.writeFileSync('test_file.txt', testFileContent);
    
    const formData = new FormData();
    formData.append('subtask_name', 'Test Subtask');
    formData.append('subtask_description', 'This is a test subtask');
    formData.append('task_id', '1'); // Assuming task ID 1 exists
    formData.append('employee_ids', JSON.stringify(['emp001'])); // Assuming emp001 exists
    formData.append('subtask_deadline', '2025-12-31 23:59');
    formData.append('subtask_priority', 'Medium');
    formData.append('admin_user_id', 'admin001'); // Assuming admin001 exists
    formData.append('attachments', fs.createReadStream('test_file.txt'));
    
    try {
        const response = await fetch('http://localhost:3000/api/projects/create-subtask', {
            method: 'POST',
            body: formData
        });
        
        console.log('📡 Response status:', response.status);
        const result = await response.json();
        console.log('📡 Response result:', result);
        
        if (result.success) {
            console.log('✅ Subtask creation test passed!');
        } else {
            console.log('❌ Subtask creation test failed:', result.error);
        }
    } catch (error) {
        console.error('❌ Test error:', error);
    } finally {
        // Clean up test file
        if (fs.existsSync('test_file.txt')) {
            fs.unlinkSync('test_file.txt');
        }
    }
}

testSubtaskCreation(); 