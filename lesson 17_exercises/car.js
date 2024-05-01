class Car {
  brand;
  model;
  speed = 0;
  isTrunkOpen = false;

  constructor(carInfo) {
    this.brand = carInfo.brand;
    this.model = carInfo.model;
  }

  displayInfo() {
    const trunkStatus = this.isTrunkOpen ? 'open' : 'closed';
    return `${this.brand} ${this.model}, Speed: ${this.speed} km/h, Trunk: ${trunkStatus}`;
  }

  go() {
    if (!this.isTrunkOpen) {
      this.speed += 5;
    }

    //limit the speed to 200:
    if (this.speed > 200) {
      this.speed = 200;
    }

    return this.speed;
  }

  brake() {
    this.speed -= 5;

    //limit speed to 0
    if (this.speed < 0) {
      this.speed = 0;
    }
    return this.speed;
  }

  openTrunk() {
    if (this.speed === 0) {
      this.isTrunkOpen = true;
    }
  }

  closeTrunk() {
    this.isTrunkOpen = false;
  }
}

const cars = [
  { brand: 'Toyota', model: 'Coralla' },
  { brand: 'Tesla', model: 'Model 3' },
].map((car) => {
  return new Car(car);
});

cars.forEach((car) => console.log(car.displayInfo(), car.go(), car.brake()));
