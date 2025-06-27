async function loginAPI(user_id, password) {
    const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, password })
    });

    return await response.json();
}
