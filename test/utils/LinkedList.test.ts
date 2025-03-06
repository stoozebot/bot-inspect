import { beforeEach, describe, expect, it } from 'vitest';
import LinkedList from '../../src/utils/LinkedList';

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
	});

	it('should insert at the start.', () => {
		expect(list.peek()).toBe(30);
	});

	it('should insert at the end.', () => {
		list.insertEnd(40);
		list.insertEnd(50);
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
	});

	it('should delete from end', () => {
		let exact = list.peek(list.length() - 2);
		list.deleteEnd();
		expect(list.getTail()).toBe(exact);

		exact = list.peek(list.length() - 2);
		list.deleteEnd();
		expect(list.getTail()).toBe(exact);
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
