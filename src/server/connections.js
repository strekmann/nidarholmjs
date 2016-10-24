const PREFIX = 'connection:';

function base64(str) {
  return new Buffer(str, 'ascii').toString('base64');
}

function unbase64(b64) {
  return new Buffer(b64, 'base64').toString('ascii');
}

export function offsetToCursor(offset) {
  return base64(PREFIX + offset);
}

function cursorToOffset(cursor) {
  return parseInt(unbase64(cursor).substring(PREFIX.length), 10);
}

function getOffsetWithDefault(cursor, defaultOffset) {
  let offset;
  if (cursor === undefined) {
    return defaultOffset;
  }
  offset = cursorToOffset(cursor);
  return isNaN(offset) ? defaultOffset : offset;
}

function getOffsetsFromArgs(inArgs, count) {
  let skip;
  let limit;

  const args = inArgs || {};
  const after = args.after;
  const before = args.before;
  const first = args.first;
  const last = args.last;

  const beforeOffset = getOffsetWithDefault(before, count);
  const afterOffset = getOffsetWithDefault(after, -1);

  let startOffset = Math.max(-1, afterOffset) + 1;
  let endOffset = Math.min(count, beforeOffset);

  if (first !== undefined) {
    endOffset = Math.min(endOffset, startOffset + first);
  }
  if (last !== undefined) {
    startOffset = Math.max(startOffset, endOffset - last);
  }

  skip = Math.max(startOffset, 0);
  limit = endOffset - startOffset;

  return {
    beforeOffset: beforeOffset,
    afterOffset: afterOffset,
    startOffset: startOffset,
    endOffset: endOffset,
    skip: skip,
    limit: limit,
  };
}

function getConnectionFromSlice(inSlice, mapper, args, count) {
  const first = args.first;
  const last = args.last;
  const before = args.before;
  const after = args.after;

  const offsetsFromArgs = getOffsetsFromArgs(args, count);
  const startOffset = offsetsFromArgs.startOffset;
  const endOffset = offsetsFromArgs.endOffset;
  const beforeOffset = offsetsFromArgs.beforeOffset;
  const afterOffset = offsetsFromArgs.afterOffset;

  // If we have a mapper function, map it!
  const slice = typeof mapper === 'function' ? inSlice.map(mapper) : inSlice;

  const edges = slice.map(function mapSliceToEdges(value, index) {
    return {
      cursor: offsetToCursor(startOffset + index),
      node: value,
    };
  });

  const firstEdge = edges[0];
  const lastEdge = edges[edges.length - 1];
  const lowerBound = after ? afterOffset + 1 : 0;
  const upperBound = before ? Math.min(beforeOffset, count) : count;

  return {
    edges: edges,
    pageInfo: {
      startCursor: firstEdge ? firstEdge.cursor : null,
      endCursor: lastEdge ? lastEdge.cursor : null,
      hasPreviousPage: last !== null ? startOffset > lowerBound : false,
      hasNextPage: first !== null ? endOffset < upperBound : false,
    },
  };
}

export function connectionFromMongooseQuery(query, inArgs, mapper) {
  const args = inArgs || {};

  return query.count()
    .then(function countPromise(count) {
      var pagination = getOffsetsFromArgs(args, count);

      if (pagination.limit === 0) {
        return getConnectionFromSlice([], mapper, args, count);
      }

      query.skip(pagination.skip);
      query.limit(pagination.limit);

      return query.find().then(function fromSlice(slice) {
        return getConnectionFromSlice(slice, mapper, args, count);
      });
    });
}