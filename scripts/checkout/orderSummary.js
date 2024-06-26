import {
  cart,
  removeFromCart,
  calculateCartQuantity,
  updateCart,
  updateDeliveryOption,
} from '../../data/cart.js';
import { getProduct, products } from '../../data/products.js';
import { formatCurrency } from '../utils/money.js';
import {
  deliveryOptions,
  getDeliveryOption,
  calculateDeliveryDate,
} from '../../data/deliveryOptions.js';
import { renderPaymentSummary } from './paymentSummary.js';
import { renderCheckoutHeader } from './checkoutHeader.js';
// const today = dayjs();
// const deliveryDate = today.add(7, 'days');
// console.log(deliveryDate.format('dddd, MMMM D'));

export function renderOrderSummary() {
  let cartSummaryHTML = '';

  cart.forEach((cartItem) => {
    const productId = cartItem.productId;

    const matchingProduct = getProduct(productId);

    const deliveryOptionId = cartItem.deliveryOptionId;

    const deliveryOption = getDeliveryOption(deliveryOptionId);

    calculateDeliveryDate(deliveryOption);

    cartSummaryHTML += `
      <div class="cart-item-container js-cart-item-container-${
        matchingProduct.id
      }">
        <div class="delivery-date">
          Delivery date: ${calculateDeliveryDate(deliveryOption)}
        </div>

        <div class="cart-item-details-grid">
          <img class="product-image"
            src='${matchingProduct.image}''>

          <div class="cart-item-details">
            <div class="product-name">
              ${matchingProduct.name}
            </div>
            <div class="product-price">
              ${matchingProduct.getPrice()}
            </div>
            <div class="product-quantity">
              <span>
                Quantity: <span class="quantity-label js-quantity-label-${
                  matchingProduct.id
                }">${cartItem.quantity}</span>
              </span>
              <span class="update-quantity-link link-primary js-update-link" data-product-id=${
                matchingProduct.id
              }>
                Update
              </span>
              
              <input class="quantity-input js-quantity-input-${
                matchingProduct.id
              }" data-product-id=${matchingProduct.id}>
              <span class="save-quantity-link link-primary js-save-link" data-product-id=${
                matchingProduct.id
              }> Save </span>
              <span class="delete-quantity-link link-primary js-delete-link" data-product-id=${
                matchingProduct.id
              }>
                Delete
              </span>
            </div>
          </div>

          <div class="delivery-options">
            <div class="delivery-options-title">
              Choose a delivery option:
            </div>
            ${deliveryOptionsHTML(matchingProduct, cartItem)};
          </div>
        </div>
      </div>
    `;
  });

  function deliveryOptionsHTML(matchingProduct, cartItem) {
    let html = '';

    deliveryOptions.forEach((deliveryOption) => {
      calculateDeliveryDate(deliveryOption);
      const priceString =
        deliveryOption.priceCents === 0
          ? 'FREE'
          : `$${formatCurrency(deliveryOption.priceCents)} -`;

      const isChecked = deliveryOption.id === cartItem.deliveryOptionId;

      html += `
      <div class="delivery-option js-delivery-option"
      data-product-id = ${matchingProduct.id}
      data-delivery-option-id = ${deliveryOption.id}>
        <input type="radio" 
          ${isChecked ? 'checked' : ''}
          class="delivery-option-input"
          name="delivery-option-${matchingProduct.id}">
        <div>
          <div class="delivery-option-date">
            ${calculateDeliveryDate(deliveryOption)}
          </div>
          <div class="delivery-option-price">
            ${priceString} Shipping
          </div>
        </div>
      </div>
      `;
    });

    return html;
  }

  document.querySelector('.js-order-summary').innerHTML = cartSummaryHTML;

  document.querySelectorAll('.js-delete-link').forEach((link) => {
    link.addEventListener('click', () => {
      const productId = link.dataset.productId;

      removeFromCart(productId);
      renderCheckoutHeader();

      // const container = document.querySelector(
      //   `.js-cart-item-container-${productId}`
      // );
      // container.remove();

      //instead of using DOM and updating the page directly with .remove() like above, we can regenerate the order summary:
      renderOrderSummary();

      //regenerating HTML for payment summary after deleting items in order summary.
      renderPaymentSummary();
    });
  });

  document.querySelectorAll('.js-update-link').forEach((link) => {
    link.addEventListener('click', () => {
      const productId = link.dataset.productId;

      const container = document.querySelector(
        `.js-cart-item-container-${productId}`
      );

      container.classList.add('is-editing-quantity');
    });
  });

  document.querySelectorAll('.quantity-input').forEach((link) => {
    link.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        const productId = link.dataset.productId;

        //we need to move the quantity related code up because if the newQuantity is not valid, we should return early or NOT run the rest of the code. this is call "early return".
        const newQuantity = Number(
          document.querySelector(`.js-quantity-input-${productId}`).value
        );

        if (newQuantity < 0 || newQuantity >= 1000) {
          alert('Quantity must be at least 0 or less than 1000');
          return;
        }
        updateCart(productId, newQuantity);

        const container = document.querySelector(
          `.js-cart-item-container-${productId}`
        );

        container.classList.remove('is-editing-quantity');

        const quantityLabel = document.querySelector(
          `.js-quantity-label-${productId}`
        );
        quantityLabel.innerHTML = newQuantity;

        // updateCart(productId, newQuantity);
        renderCheckoutHeader();
        renderPaymentSummary();
      }
    });
  });

  document.querySelectorAll('.js-save-link').forEach((link) => {
    link.addEventListener('click', () => {
      const productId = link.dataset.productId;

      //we need to move the quantity related code up because if the newQuantity is not valid, we should return early or NOT run the rest of the code. this is call "early return".
      const newQuantity = Number(
        document.querySelector(`.js-quantity-input-${productId}`).value
      );

      if (newQuantity < 0 || newQuantity >= 1000) {
        alert('Quantity must be at least 0 or less than 1000');
        return;
      }
      updateCart(productId, newQuantity);

      const container = document.querySelector(
        `.js-cart-item-container-${productId}`
      );

      container.classList.remove('is-editing-quantity');

      // const quantityLabel = document.querySelector(
      //   `.js-quantity-label-${productId}`
      // );
      // quantityLabel.innerHTML = newQuantity;

      //update the page instead of update via DOM like above >> that's called MCV
      updateCart(productId, newQuantity);

      renderCheckoutHeader();
      renderPaymentSummary();
    });
  });

  // to make the shipping interactive (without reloading the page)
  document.querySelectorAll('.js-delivery-option').forEach((element) => {
    element.addEventListener('click', () => {
      const { productId, deliveryOptionId } = element.dataset; //using shorthand property
      updateDeliveryOption(productId, deliveryOptionId);
      renderOrderSummary();
      renderPaymentSummary();
    });
  });
}
