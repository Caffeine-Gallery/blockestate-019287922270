import { backend } from 'declarations/backend';
import { AuthClient } from '@dfinity/auth-client';

let authClient;
let principal;

async function init() {
    authClient = await AuthClient.create();
    if (await authClient.isAuthenticated()) {
        principal = authClient.getIdentity().getPrincipal();
        handleAuthenticated();
    } else {
        await login();
    }
}

async function login() {
    await authClient.login({
        identityProvider: "https://identity.ic0.app/#authorize",
        onSuccess: () => {
            principal = authClient.getIdentity().getPrincipal();
            handleAuthenticated();
        },
    });
}

async function handleAuthenticated() {
    await loadProperties();
    await loadUserShares();
}

async function loadProperties() {
    const properties = await backend.getAllProperties();
    const propertyList = document.getElementById('propertyList');
    propertyList.innerHTML = '';

    properties.forEach(property => {
        const propertyElement = document.createElement('div');
        propertyElement.className = 'property';
        propertyElement.innerHTML = `
            <h3>${property.name}</h3>
            <p>Total Value: $${property.totalValue.toFixed(2)}</p>
            <div class="areas"></div>
        `;

        const areasContainer = propertyElement.querySelector('.areas');
        property.areas.forEach(area => {
            const areaElement = document.createElement('div');
            areaElement.className = 'area';
            areaElement.innerHTML = `
                <h4>${area.name}</h4>
                <p>Available Shares: ${area.availableShares}</p>
                <p>Price per Share: $${area.pricePerShare.toFixed(2)}</p>
                <input type="number" id="amount-${property.id}-${area.id}" min="1" max="${area.availableShares}" value="1">
                <button onclick="buyShares(${property.id}, ${area.id})">Buy Shares</button>
            `;
            areasContainer.appendChild(areaElement);
        });

        propertyList.appendChild(propertyElement);
    });
}

async function loadUserShares() {
    const shares = await backend.getUserShares(principal);
    const userSharesList = document.getElementById('userSharesList');
    userSharesList.innerHTML = '';

    shares.forEach(share => {
        const shareElement = document.createElement('div');
        shareElement.className = 'share';
        shareElement.innerHTML = `
            <p>Property ID: ${share.propertyId}</p>
            <p>Area ID: ${share.areaId}</p>
            <p>Amount: ${share.amount}</p>
        `;
        userSharesList.appendChild(shareElement);
    });
}

window.buyShares = async function(propertyId, areaId) {
    const amountInput = document.getElementById(`amount-${propertyId}-${areaId}`);
    const amount = parseInt(amountInput.value, 10);

    if (amount > 0) {
        const result = await backend.buyShares(propertyId, areaId, amount);
        if (result !== null) {
            alert(`Successfully bought ${amount} shares!`);
            await loadProperties();
            await loadUserShares();
        } else {
            alert('Failed to buy shares. Please try again.');
        }
    } else {
        alert('Please enter a valid amount of shares to buy.');
    }
}

init();
