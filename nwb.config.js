// module.exports = {
//   type: 'react-app'
// }


module.exports = {
  type: 'react-app',
  babel: {
    plugins: [["import", { "libraryName": "antd", "style": "css" }]]
  },
  webpack: {
    publicPath: '',
    extra: {
      devtool: 'eval'
    }
  }
}