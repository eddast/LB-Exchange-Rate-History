const path = require("path");

var config = {

    /* The entry point of the application. Webpack uses this information to 
    create the dependency tree which is used to bundle the scripts.*/
    entry: ["./src/index.tsx"],

    /* This information is used to give the name of the bundled file and the 
    location of the bundled file. */
    output: {
        path: path.resolve(__dirname, "build"),
        publicPath: "/build/",
        filename: "bundle.js"
    },

    /*  The extensions which will be imported or required in the application
    scripts. */
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".css"]
    },

    module: {
        // apply loaders to files that meet given conditions
        loaders: [{
            test: /\.jsx?$/,
            include: path.join(__dirname, '/client/src'),
            loader: 'babel-loader',
            query: {
            presets: ["react", "es2015", "stage-1"]
            }
        },
        {
            test: /\.(gif|svg|jpg|png)$/,
            loader: "file-loader",
        }],
        rules: [{
            enforce: 'pre',
            test: /\.tsx?$/,
            use: "source-map-loader",
            exclude: /node_modules/
        },{
            test: /\.tsx?$/,
            loader: "ts-loader",
            exclude: /node_modules/
        },{
            test: /\.css$/,
            loader: 'style-loader!css-loader'
        },{
            test: /\.(gif|svg|jpg|png)$/,
            loader: "file-loader",
        }],
        /* 
         * Define the loaders to be used. Regex will test the type of files on 
         * which the loader is to be applied. The excluded files are also mentioned.
         * Loaders are used mainly to transpile the file before bundling.
         */
    },
    devtool: 'inline-source-map',
};

module.exports = config;