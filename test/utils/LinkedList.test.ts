import { beforeEach, describe, expect, it } from 'vitest';
import LinkedList, { Node } from '../../src/utils/LinkedList';

describe('Linked List', () => {
	const list = new LinkedList<number>();
	const list2 = new LinkedList<number>();

	beforeEach(() => {
		list.deleteAll();
		list.insertStart(10);
		list.insertStart(20);
		list.insertStart(30);
	});

	it('should delete the whole list', () => {
		expect(list.isEmpty()).toBe(false);
		list.deleteAll();
		expect(list.isEmpty()).toBe(true);
	});

	it('should allow peeking.', () => {
		expect(list.peek()).toBe(30);
		expect(list.peek(0)).toBe(30);
		expect(list.peek(1)).toBe(20);
		expect(list.peek(2)).toBe(10);
		expect(() => list.peek(3)).throws();
	});

	it('should allow peeking a node.', () => {
		expect(() => list.peekNode(-1)?.data).throws();
		expect(list.peekNode()?.data).toBe(30);
		expect(list.peekNode(0)?.data).toBe(30);
		expect(list.peekNode(1)?.data).toBe(20);
		expect(list.peekNode(2)?.data).toBe(10);
		expect(() => list.peekNode(3)?.data).throws();
	});

	it('should insert at the start.', () => {
		expect(list.peek()).toBe(30);
		list.insertStart(40);
		expect(list.peek()).toBe(40);
	});

	it('should insert at the end.', () => {
		list.insertEnd(40);
		list.insertEnd(50);
		expect(list.getTail()).toBe(50);
		list.insertEnd(60);
		expect(list.getTail()).toBe(60);
	});

	it('should insert at any position', () => {
		list.insert(70, 3);
		expect(list.peek(3)).toBe(70);
		list.insert(80, 2);
		expect(list.peek(2)).toBe(80);
	});

	it('should delete from start', () => {
		let exact = list.peek(1);
		list.deleteStart();
		expect(list.peek()).toBe(exact);
		exact = list.peek(1);
		list.deleteStart();
		expect(list.peek()).toBe(exact);

		list.deleteAll();
		expect(() => list.deleteStart()).throws();
	});

	it('should delete from end', () => {
		let exact = list.peek(list.length() - 2);
		list.deleteEnd();
		expect(list.getTail()).toBe(exact);

		exact = list.peek(list.length() - 2);
		list.deleteEnd();
		expect(list.getTail()).toBe(exact);

		list.deleteAll();
		expect(() => list.deleteEnd()).throws();
	});

	it('should delete from any position', () => {
		list.insertEnd(40);
		list.insertEnd(50);
		list.insertEnd(60);
		list.insertEnd(70);

		let exact = list.peek(3);
		list.delete(2);
		expect(list.peek(2)).toBe(exact);

		exact = list.peek(5);
		list.delete(4);
		expect(list.peek(4)).toBe(exact);

		expect(() => list.delete(-1)).throws();
		expect(() => list.delete(list.length())).throws();
	});

	it('should check empty', () => {
		expect(list2.isEmpty()).toBe(true);
		list2.insert(10, 0);
		expect(list2.isEmpty()).toBe(false);
	});

	it('should get length', () => {
		expect(list.length()).toBe(3);
		list.insert(40);
		expect(list.length()).toBe(4);
	});
});

describe('Node', () => {
	const node = new Node<number>(10);
	node.next = new Node<number>(20);

	it('should get the next node', () => {
		expect(node.next).toEqual({ data: 20, next: null, connector: null });
	});

	it('should connect and get the connection', () => {
		const node2 = new Node(30);
		node.connect(node2);

		expect(node.getConnection()).toEqual(node2);
		expect(node2.getConnection()).toEqual(node);
	});
});
