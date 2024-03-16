export const success = (res, data, message) => {
  res.status(200).json({ status: 'success', data, message })
}

// handle all types of errors
export const invalidRequest = (res, message, statusCode = 400) => {
  res.status(statusCode).json({ status: 'fail', message })
}

export const serverError = (res, message) => {
  res.status(500).json({ status: 'fail', message })
}
