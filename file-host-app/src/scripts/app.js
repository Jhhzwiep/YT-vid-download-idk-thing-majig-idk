// src/scripts/app.js

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://couxglcdmrfkjjtgdezn.supabase.co'; // Replace with your Supabase URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvdXhnbGNkbXJma2pqdGdkZXpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1Njc1ODksImV4cCI6MjA2MDE0MzU4OX0.Q5pLjNm3VFDrkcIUmi8h85VfU3C059EGhVpShCyIAcU'; // Replace with your Supabase anon key
const supabase = createClient(supabaseUrl, supabaseKey);

// Drag and drop functionality
const dropArea = document.getElementById('drop-area');
const linkList = document.getElementById('link-list');

dropArea.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropArea.classList.add('hover');
});

dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove('hover');
});

dropArea.addEventListener('drop', async (event) => {
    event.preventDefault();
    dropArea.classList.remove('hover');

    const files = event.dataTransfer.files;
    if (files.length > 0) {
        await uploadFiles(files);
    }
});

async function uploadFiles(files) {
    for (const file of files) {
        const { data, error } = await supabase.storage
            .from('your-bucket-name') // Replace with your Supabase bucket name
            .upload(`uploads/${file.name}`, file);

        if (error) {
            console.error('Error uploading file:', error.message);
            return;
        }

        const fileUrl = `${supabaseUrl}/storage/v1/object/public/your-bucket-name/uploads/${file.name}`;
        displayFileLink(fileUrl);
    }
}

function displayFileLink(fileUrl) {
    const listItem = document.createElement('li');
    const link = document.createElement('a');
    link.href = fileUrl;
    link.textContent = fileUrl;
    link.target = '_blank';
    listItem.appendChild(link);
    linkList.appendChild(listItem);
}