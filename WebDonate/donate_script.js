// MOBILE
function toggleMenu() {
    document.querySelector('.nav-links').classList.toggle('open');
}

document.getElementById("donationForm").addEventListener("submit", function (e) {
      e.preventDefault();
      const amount = document.getElementById("amountInput").value;
      this.querySelector("input[name='amount']").value = amount;
      document.getElementById("thankyouMessage").style.display = "block";
      setTimeout(() => { this.submit(); }, 2000);
    });