// Below is more complex version which is from course

// const asyncHandler = (fn) => (req, res, next) => {
//   Promise.resolve(fn(req, res, next)).catch(next);
// };

// This is the simpler one

// function asyncHandler(fn) {
//   return function (req, res, next) {
//     Promise.resolve(fn(req, res, next)).catch(next);
//   };
// }

// This one is written with try catch and async await

const asyncHandler = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next); // Wait for the async function to resolve
    } catch (err) {
      next(err); // Pass the error to Express error-handling middleware
    }
  };
};

export default asyncHandler;
