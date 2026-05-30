// Weights for notification types
const TYPE_WEIGHTS = {
  placement: 3,
  result: 2,
  event: 1
};

// Helper to parse date to timestamp ms safely
function getTimestampMs(notification) {
  if (!notification.Timestamp) return 0;
  const isoString = notification.Timestamp.replace(' ', 'T');
  const parsed = Date.parse(isoString);
  return isNaN(parsed) ? 0 : parsed;
}

// Custom comparator: negative if a has lower priority than b
function compareNotifications(a, b) {
  const weightA = TYPE_WEIGHTS[a.Type?.toLowerCase()] || 0;
  const weightB = TYPE_WEIGHTS[b.Type?.toLowerCase()] || 0;

  if (weightA !== weightB) {
    return weightA - weightB;
  }

  const timeA = getTimestampMs(a);
  const timeB = getTimestampMs(b);

  return timeA - timeB;
}

// MinHeap for holding top N items efficiently
class MinHeap {
  constructor(maxSize) {
    this.heap = [];
    this.maxSize = maxSize;
  }

  size() {
    return this.heap.length;
  }

  peek() {
    return this.heap[0] || null;
  }

  push(item) {
    if (this.size() < this.maxSize) {
      this.heap.push(item);
      this._bubbleUp(this.size() - 1);
    } else if (compareNotifications(item, this.peek()) > 0) {
      this.heap[0] = item;
      this._bubbleDown(0);
    }
  }

  getSortedList() {
    // return highest priority first
    return [...this.heap].sort((a, b) => compareNotifications(b, a));
  }

  _bubbleUp(index) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (compareNotifications(this.heap[index], this.heap[parentIndex]) < 0) {
        this._swap(index, parentIndex);
        index = parentIndex;
      } else {
        break;
      }
    }
  }

  _bubbleDown(index) {
    const length = this.size();
    while (true) {
      let smallestIndex = index;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;

      if (leftChild < length && compareNotifications(this.heap[leftChild], this.heap[smallestIndex]) < 0) {
        smallestIndex = leftChild;
      }

      if (rightChild < length && compareNotifications(this.heap[rightChild], this.heap[smallestIndex]) < 0) {
        smallestIndex = rightChild;
      }

      if (smallestIndex !== index) {
        this._swap(index, smallestIndex);
        index = smallestIndex;
      } else {
        break;
      }
    }
  }

  _swap(i, j) {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }
}

// Filter read items and retrieve top N priority notifications
function getPriorityNotifications(notifications, n = 10, readIds = []) {
  if (!Array.isArray(notifications)) return [];

  const heap = new MinHeap(n);
  const readSet = new Set(readIds);

  for (const notif of notifications) {
    if (readSet.has(notif.ID)) {
      continue;
    }
    heap.push(notif);
  }

  return heap.getSortedList();
}

module.exports = {
  compareNotifications,
  MinHeap,
  getPriorityNotifications
};
