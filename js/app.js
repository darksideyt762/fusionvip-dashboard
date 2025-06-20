const api = path => `/.netlify/functions/${path}`;
const tableBody = document.getElementById('hwidTable');
const form = document.getElementById('addForm');
const searchInput = document.getElementById('search');
let hwidList = [];

window.onload = async () => await fetchHWIDs();

async function fetchHWIDs() {
  const res = await fetch(api('read-hwid'));
  const data = await res.json();
  hwidList = data.lines;
  renderTable(hwidList);
}

function renderTable(list) {
  tableBody.innerHTML = '';
  list.forEach((line, index) => {
    const [hwid, user, date, role] = line.split(' ');
    const tr = document.createElement('tr');
    tr.className = "bg-white/10 rounded";
    tr.innerHTML = `
      <td>${hwid}</td>
      <td>${user}</td>
      <td>${date}</td>
      <td>${role}</td>
      <td class="space-x-2">
        <button onclick="editLine(${index})" class="px-2 py-1 bg-yellow-300 text-black text-xs rounded">Edit</button>
        <button onclick="deleteLine(${index})" class="px-2 py-1 bg-red-500 text-white text-xs rounded">Delete</button>
      </td>`;
    tableBody.appendChild(tr);
  });
}

form.onsubmit = async (e) => {
  e.preventDefault();
  const hwid = document.getElementById('hwid').value.trim();
  const username = document.getElementById('username').value.trim();
  const expiry = document.getElementById('expiry').value;
  const role = document.getElementById('role').value.trim();
  if (!hwid || !username || !expiry || !role) return;
  const line = `${hwid} ${username} ${expiry} ${role}`;
  const res = await fetch(api('write-hwid'), {
    method: "POST",
    body: JSON.stringify({ line })
  });
  const result = await res.json();
  if (result.success) {
    await fetchHWIDs();
    form.reset();
  } else {
    alert("Failed to add line.");
  }
};

async function deleteLine(index) {
  const res = await fetch(api('delete-hwid'), {
    method: "POST",
    body: JSON.stringify({ index })
  });
  const result = await res.json();
  if (result.success) await fetchHWIDs();
  else alert("❌ Failed to delete.");
}

function editLine(index) {
  const [hwid, user, expiry, role] = hwidList[index].split(' ');
  const newHwid = prompt("HWID:", hwid);
  const newUser = prompt("Username:", user);
  const newDate = prompt("Expiry Date (YYYY-MM-DD):", expiry);
  const newRole = prompt("Role:", role);
  if (!newHwid || !newUser || !newDate || !newRole) return;
  const line = `${newHwid} ${newUser} ${newDate} ${newRole}`;
  updateLine(index, line);
}

async function updateLine(index, line) {
  const res = await fetch(api('edit-hwid'), {
    method: "POST",
    body: JSON.stringify({ index, line })
  });
  const result = await res.json();
  if (result.success) await fetchHWIDs();
  else alert("❌ Failed to edit.");
}

searchInput.addEventListener('input', () => {
  const keyword = searchInput.value.toLowerCase();
  const filtered = hwidList.filter(line => line.toLowerCase().includes(keyword));
  renderTable(filtered);
});
