export class Car {
    car_id: string;
    cars_marka: string;
    cars_tanirovka: string;
    cars_motor: string;
    cars_year: number;
    cars_color: string;
    cars_distance: string;
    cars_gearbook: string;
    cars_description: string;
    cars_img: string;
    category_id: string;
    car_price: number;
  
    constructor(
      car_id: string,
      cars_marka: string,
      cars_tanirovka: string,
      cars_motor: string,
      cars_year: number,
      cars_color: string,
      cars_distance: string,
      cars_gearbook: string,
      cars_description: string,
      cars_img: string,
      category_id: string,
      car_price: number
    ) {
      this.car_id = car_id;
      this.cars_marka = cars_marka;
      this.cars_tanirovka = cars_tanirovka;
      this.cars_motor = cars_motor;
      this.cars_year = cars_year;
      this.cars_color = cars_color;
      this.cars_distance = cars_distance;
      this.cars_gearbook = cars_gearbook;
      this.cars_description = cars_description;
      this.cars_img = cars_img;
      this.category_id = category_id;
      this.car_price = car_price;
    }
  }
  