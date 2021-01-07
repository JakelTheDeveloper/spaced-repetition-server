
class _Node {
    constructor(value, next) {
        this.value = value
        this.next = next
    }
}

class LinkedList {
    constructor() {
        this.head = null
    }

    insertFirst(item) {
        this.head = new _Node(item, this.head)
    }

    insertLast(item) {
        if (this.head === null) {
            this.insertFirst(item)
        } else {
            let tail = this.head
            while (tail.next !== null) {
                tail = tail.next
            }
            tail.next = new _Node(item, null)
        }
    }

    getAnswer(mv) {
        let count = 0
        let current = this.head

        while (count < mv && current.next !== null) {
            current = current.next
            count++
        }

        const answer = new _Node(this.head.value)
        if (current.next === null) {
            answer.next = current.next
            current.next = answer
            this.head = this.head.next
            current.value.next = answer.value.id
            answer.value.next = null
        } else {
            answer.next = current.next
            current.next = answer
            this.head = this.head.next
            current.value.next = answer.value.id
            answer.value.next = answer.next.value.id
        }
        return answer
    }

    insertBefore(value, index) {
        let temp = this.head
        while (temp.next.value !== index) {
            temp = temp.next
        }
        temp.next = new _Node(value, temp.next)
    }

    insertAfter(value, index) {
        let temp = this.head
        while (temp.value !== index) {
            temp = temp.next
        }
        temp.next = new _Node(value, temp.next)
    }

    insertAt(value, index) {
        let temp = this.head
        let count = 0

        while (temp.value !== null && count < index - 1) {
            temp = temp.next
            count++
        }
        temp.next = new _Node(value, temp.next)
    }

    find(item) {
        let currentNode = this.head
        if (!this.head) {
            return null
        }
        while (currentNode.value !== item) {
            if (currentNode.next === null) {
                return null
            } else {
                currentNode = currentNode.next
            }
            return currentNode
        }
    }

    remove(item) {
        if (!this.head) {
            return null
        }
        if (this.head.value === item) {
            this.head = this.head.next
            return
        }
        let currentNode = this.head
        let previousNode = this.head

        while (currentNode !== null && currentNode.value !== item) {
            previousNode = currentNode
            currentNode = currentNode.next
        }
        if (currentNode === null) {
            return
        }
        previousNode.next = currentNode.next
    }
}

function createArray(list) {
    let current = list.head
    let result = []
    while (current.next !== null) {
        result.push(current.value)
        current = current.next
    }
    result.push(current.value)
    return result
}

module.exports = { LinkedList, createArray }