export default class LinkedList<T> {
	private head: Node<T> | null = null;
	private tail: Node<T> | null = null;
	private count: number = 0;

	constructor() {}

	public insertStart(data: T): void {
		const newNode = new Node<T>(data, null);
		if (this.isEmpty()) {
			this.head = newNode;
			this.tail = newNode;
		} else {
			newNode.next = this.head;
			this.head = newNode;
		}

		this.count++;
	}

	public insertEnd(data: T) {
		const newNode = new Node<T>(data, null);
		if (this.isEmpty()) {
			this.head = newNode;
			this.tail = newNode;
		} else {
			(this.tail as Node<T>).next = newNode;
			this.tail = newNode;
		}
		this.count++;
	}

	public insert(data: T, index: number = this.count) {
		if (index > this.count || index < 0) {
			throw new Error(`Invalid index: ${index}`);
		} else if (index === 0) {
			this.insertStart(data);
			return;
		} else if (index === this.count) {
			this.insertEnd(data);
			return;
		} else {
			const newNode = new Node<T>(data, null);
			let currNode = this.head as Node<T>;
			for (let i = 1; i < index; i++) {
				if (!currNode.next) throw new Error(`Invalid index: ${index}`);
				currNode = currNode.next;
			}
			newNode.next = currNode.next;
			currNode.next = newNode;
		}

		this.count++;
	}

	public deleteStart(): T {
		if (this.isEmpty()) {
			throw new Error('cannot delete from an empty list');
		}

		let currNode = this.head as Node<T>;
		if (this.count == 1) {
			this.head = null;
			this.tail = null;
		} else {
			this.head = (this.head as Node<T>).next;
			currNode.next = null;
		}

		this.count--;

		return currNode.data;
	}

	public deleteEnd(): T {
		if (this.isEmpty()) {
			throw new Error('cannot delete from an empty list');
		}

		let currNode = this.head as Node<T>;
		if (this.count == 1) {
			this.head = null;
			this.tail = null;
		} else {
			while ((currNode.next as Node<T>).next !== null) {
				currNode = currNode.next as Node<T>;
			}

			this.tail = currNode;
			this.tail.next = null;
		}

		this.count--;

		return currNode.data;
	}

	public delete(index: number): T {
		if (index >= this.count || index < 0) {
			throw new Error(`invalid index: ${index}`);
		} else if (index === 0) {
			return this.deleteStart();
		} else if (index === this.count - 1) {
			return this.deleteEnd();
		} else {
			let currNode = this.head;
			for (let i = 1; i < index; i++) {
				currNode = (currNode as Node<T>).next;
			}

			let temp = (currNode as Node<T>).next as Node<T>;
			(currNode as Node<T>).next = ((currNode as Node<T>).next as Node<T>).next;
			temp.next = null;

			this.count--;
			return temp.data;
		}
	}

	public deleteAll() {
		this.head = null;
		this.tail = null;

		this.count = 0;
	}

	public peek(index?: number): T | null {
		if (index == undefined || index == 0) return this.head ? this.head.data : null;
		if (index >= this.count || index < 0) {
			throw new Error(`invalid index: ${index}`);
		} else if (index == this.count - 1) {
			return (this.tail as Node<T>).data;
		} else {
			let currNode = this.head;
			for (let i = 1; i <= index; i++) {
				currNode = (currNode as Node<T>).next;
			}

			return (currNode as Node<T>).data;
		}
	}

	public peekNode(index?: number): Node<T> | null {
		if (index == undefined || index == 0) return this.head;
		if (index >= this.count || index < 0) {
			throw new Error(`invalid index: ${index}`);
		} else if (index == this.count - 1) {
			return this.tail;
		} else {
			let currNode = this.head;
			for (let i = 1; i <= index; i++) {
				currNode = (currNode as Node<T>).next;
			}

			return currNode;
		}
	}

	public getTail(): T | null {
		return this.tail ? this.tail.data : null;
	}

	public isEmpty(): boolean {
		return this.head == null;
	}

	public length(): number {
		return this.count;
	}
}

export class Node<T> {
	private connector: Node<any> | null = null;
	constructor(public data: T, public next: Node<T> | null = null) {}

	public getConnection(): Node<any> | null {
		return this.connector;
	}

	public connect(node: Node<any>): void {
		this.connector = node;
		if (!node.getConnection()) {
			node.connect(this);
		}
	}
}
