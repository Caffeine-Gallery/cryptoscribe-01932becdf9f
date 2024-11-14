import { backend } from "declarations/backend";

let quill;

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Quill editor
    quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ 'header': 1 }, { 'header': 2 }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'script': 'sub'}, { 'script': 'super' }],
                [{ 'indent': '-1'}, { 'indent': '+1' }],
                ['link', 'image'],
                ['clean']
            ]
        }
    });

    // Load initial posts
    await loadPosts();

    // Event Listeners
    document.getElementById('newPostBtn').addEventListener('click', showPostForm);
    document.getElementById('cancelBtn').addEventListener('click', hidePostForm);
    document.getElementById('blogPostForm').addEventListener('submit', handleSubmit);
});

async function loadPosts() {
    showLoading(true);
    try {
        const posts = await backend.getPosts();
        displayPosts(posts);
    } catch (error) {
        console.error('Error loading posts:', error);
    }
    showLoading(false);
}

function displayPosts(posts) {
    const container = document.getElementById('postsContainer');
    container.innerHTML = '';

    posts.forEach(post => {
        const date = new Date(Number(post.timestamp) / 1000000); // Convert nano to milliseconds
        const postElement = document.createElement('article');
        postElement.className = 'post-card';
        postElement.innerHTML = `
            <h2>${post.title}</h2>
            <div class="post-meta">
                <span class="author">By ${post.author}</span>
                <span class="date">${date.toLocaleDateString()}</span>
            </div>
            <div class="post-content">${post.body}</div>
        `;
        container.appendChild(postElement);
    });
}

async function handleSubmit(e) {
    e.preventDefault();
    showLoading(true);

    const title = document.getElementById('postTitle').value;
    const author = document.getElementById('authorName').value;
    const body = quill.root.innerHTML;

    try {
        await backend.createPost(title, body, author);
        hidePostForm();
        await loadPosts();
        document.getElementById('blogPostForm').reset();
        quill.setContents([]);
    } catch (error) {
        console.error('Error creating post:', error);
    }

    showLoading(false);
}

function showPostForm() {
    document.getElementById('postForm').style.display = 'block';
}

function hidePostForm() {
    document.getElementById('postForm').style.display = 'none';
}

function showLoading(show) {
    document.getElementById('loadingSpinner').style.display = show ? 'block' : 'none';
}
