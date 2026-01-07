import { ValidationError } from '../errors';

/**
 * Address Value Object
 * 
 * Representa um endereço completo com validação básica.
 */
export class Address {
    private constructor(
        public readonly street: string,
        public readonly number: string,
        public readonly neighborhood: string,
        public readonly city: string,
        public readonly state: string,
        public readonly zipCode: string,
        public readonly country: string,
        public readonly complement?: string
    ) {}

    static create(props: {
        street: string;
        number: string;
        neighborhood: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        complement?: string;
    }): Address {
        if (!props.street?.trim()) throw new ValidationError('Street is required', 'street');
        if (!props.number?.trim()) throw new ValidationError('Number is required', 'number');
        if (!props.neighborhood?.trim()) throw new ValidationError('Neighborhood is required', 'neighborhood');
        if (!props.city?.trim()) throw new ValidationError('City is required', 'city');
        if (!props.state?.trim()) throw new ValidationError('State is required', 'state');
        if (!props.zipCode?.trim()) throw new ValidationError('Zip code is required', 'zipCode');
        if (!props.country?.trim()) throw new ValidationError('Country is required', 'country');

        return new Address(
            props.street.trim(),
            props.number.trim(),
            props.neighborhood.trim(),
            props.city.trim(),
            props.state.trim().toUpperCase(),
            props.zipCode.trim(),
            props.country.trim(),
            props.complement?.trim()
        );
    }

    toString(): string {
        const comp = this.complement ? `, ${this.complement}` : '';
        return `${this.street}, ${this.number}${comp} - ${this.neighborhood}, ${this.city}/${this.state}, ${this.zipCode}, ${this.country}`;
    }

    equals(other: Address): boolean {
        return (
            this.street === other.street &&
            this.number === other.number &&
            this.neighborhood === other.neighborhood &&
            this.city === other.city &&
            this.state === other.state &&
            this.zipCode === other.zipCode &&
            this.country === other.country &&
            this.complement === other.complement
        );
    }
    
    toJSON() {
        return {
            street: this.street,
            number: this.number,
            neighborhood: this.neighborhood,
            city: this.city,
            state: this.state,
            zipCode: this.zipCode,
            country: this.country,
            complement: this.complement,
        };
    }
}
