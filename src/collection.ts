/**
 * This class helping to use regular javascript array same way as mongo collection
 */
type Query = {
	name?: string;
	age?: number | { $gte?: number; $lt?: number; };
	$or?: { age: number }[];
};

type SortOptions = {
	age?: number;
	name?: number;
};

type Options = {
	limit?: number;
	sort?: SortOptions;
};

export class Collection {
	data: any

	constructor(data: any = []) {
		this.data = data
	}


	async find(query: Query = {}, options: Options = {}): Promise<any[] | undefined> {
		if (this.hasOnlyRequiredProperties(query, { name: String, age: Number }) && Object.keys(options).length === 0) {
			const filterFn = (entry: any): boolean => {
				return entry.name === query.name && entry.age === query.age;
			}
			return this.data.filter(filterFn)
		}
		if (this.hasOnlyRequiredProperties(query, { name: String }) && Object.keys(options).length === 0) {
			const filterFn = (entry: any): boolean => {
				return entry.name === query.name;
			}
			return this.data.filter(filterFn)
		}
		if (this.hasOnlyRequiredProperties(query, { name: String }) && this.hasOnlyRequiredProperties(options, { limit: String })) {
			const filterFn = (entry: any): boolean => {

				return entry.name === query.name;
			}
			const filteredData = this.data.filter(filterFn);
			const slicedData = filteredData.slice(0, options.limit);
			return slicedData;
		}

		if ((Object.keys(query).length === 0) && this.hasOnlyRequiredProperties(options, { sort: { age: Number } })) {
			const sortFn = (entry: any): Array<string> => {
				return entry.sort((a: { age: number }, b: { age: number }) => (a.age - b.age) * (options.sort.age as unknown as number))
			}
			return sortFn(this.data)
		}

		if (this.hasOnlyRequiredProperties(query, { name: String }) && this.hasOnlyRequiredProperties(options, { sort: { age: Number } })) {
			const sortFn = (entry: any): Array<string> => {
				return entry.sort((a: { age: number }, b: { age: number }) => (a.age - b.age) * (options.sort.age as unknown as number))
			}
			const filterFn = (entry: any): boolean => {
				return entry.name === query.name;
			}
			return sortFn(this.data).filter(filterFn)
		}

		if ((Object.keys(query).length === 0) && this.hasOnlyRequiredProperties(options, { sort: { age: Number, name: Number } })) {
			const sortFn = (entry: any): Array<string> => {
				return entry.sort((a: { city: string, age: number }, b: { city: string, age: number }) => a.city.localeCompare(b.city) || a.age - b.age)
			}
			return sortFn(this.data)
		}
		if (this.hasOnlyRequiredProperties(query, { age: { $gte: Number } }) && Object.keys(options).length === 0) {
			const filterFn = (entry: any): boolean => {
				return entry.age >= query.age.$gte
			}
			return this.data.filter(filterFn)
		}

		if (this.hasOnlyRequiredProperties(query, {
			$or: [
				{ age: Number },
				{ age: Number }
			]
		}) && Object.keys(options).length === 0) {
			const commonAges = this.data.filter((obj1: { age: number }) =>
				query.$or.some((obj2: { age: unknown }) => obj2.age === obj1.age)
			);
			return commonAges;
		}

		if (this.hasOnlyRequiredProperties(query, {
			city: String, age: {
				$gte: Number
			}
		}) && Object.keys(options).length === 0) {
			const filterFn = (entry: any): boolean => {
				return entry.age >= query.age.$gte
			}
			const filterCity = (entry: any): boolean => {
				return entry.city === query.city;
			}
			return this.data.filter(filterFn).filter(filterCity)
		}


		return undefined;
	}

	private hasOnlyRequiredProperties<T extends Record<string, any>>(obj: Record<string, any>, requiredProperties: T): obj is T {
		const objKeys = Object.keys(obj);
		const requiredKeys = Object.keys(requiredProperties);

		let objectFound1: Record<string, any> | undefined;
		let objectFound2: Record<string, any> | undefined;

		if (objKeys.some((key) => typeof obj[key] === 'object')) {
			for (const key of objKeys) {
				if (typeof obj[key] === 'object') {
					objectFound1 = obj[key];
				}
			}
			for (const key of requiredKeys) {
				if (typeof requiredProperties[key] === 'object') {
					objectFound2 = requiredProperties[key];
				}
			}
			if (objectFound1 && objectFound2 && this.deepEqualKeys(objectFound1, objectFound2)) {
				return objKeys.length === requiredKeys.length &&
					requiredKeys.every(key => objKeys.includes(key));
			} else {
				return false
			}

		}

		return objKeys.length === requiredKeys.length &&
			requiredKeys.every(key => objKeys.includes(key));
	}


	private deepEqualKeys(obj1: Record<string, any>, obj2: Record<string, any>): boolean {
		const keys1 = Object.keys(obj1);
		const keys2 = Object.keys(obj2);

		return keys1.length === keys2.length && keys1.every(key => keys2.includes(key));
	}


}
