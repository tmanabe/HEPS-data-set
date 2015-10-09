var system = require("system"),
    page = require("webpage").create();

const url = system.args[1],
    xPath = system.args[2];

phantom.outputEncoding = "utf8";
page.onConsoleMessage = null;
page.onError = null;
page.settings.resourceTimeout = 30 * 60 * 1000; // ms = 30 minutes

if(system.args.length !== 3) {

    console.log("Usage: phantomjs " + system.args[0] + " url xPath")
    phantom.exit(100);

}

page.onResourceReceived = function(res) {

    if( (res.url === url) && (res.stage === "end") && (res.status === 403) ){

        phantom.exit(43);

    }

};

page.open(url, function(status) {

    var html, rawString;

    if(status !== "success") phantom.exit(1);

    // Remove Wayback toolbar
    page.evaluate(function() {

        var children = document.body.childNodes,
            i = children.length - 1;

        for(; 0 <= i; i--) {

            if(children[i].data === " END WAYBACK TOOLBAR INSERT ") break;

        }

        for(; 0 <= i; i--) {

            document.body.removeChild(children[i]);

        }

    });

    // Extract content body
    page.evaluate(function(xPath) {

        var body = document.body, current,
            iter = document.evaluate(xPath, body, null,
                XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null),
            no_match = true;

        // Collect content nodes
        while(current = iter.iterateNext() ) {

            current.__is_content = true;
            no_match = false;

        }

        if(no_match) phantom.exit(10);

        // Remove non-content nodes
        (function(node){

            var i = node.childNodes.length - 1,
                span;

            for(; 0 <= i; i--) arguments.callee(node.childNodes[i]);

            if(node.childNodes.length < 1 && !node.__is_content) {

                if(node.previousSibling && node.previousSibling.nodeName === "#text")
                    node.previousSibling.textContent += " ";
                node.parentNode.removeChild(node);

            }

        })(body);

    }, xPath);

    // Insert BASE element
    page.evaluate(function() {

        var i = 0,
            bases = document.getElementsByTagName("base"),
            base;

        for(; i < bases.length; i++) bases[i]["href"] = document.location.href;

        base = document.createElement("base");
        base["href"] = document.location.href;
        document.head.insertBefore(base, document.head.childNodes[0]);

    });

    // Insert META element
    page.evaluate(function() {

        var meta = document.createElement("meta");

        meta.httpEquiv = "Content-Type";
        meta["content"] = "text/html; charset=UTF-8";
        document.head.insertBefore(meta, document.head.childNodes[0]);

    });

    // Remove SCRIPT elements
    page.evaluate(function() {

        var scripts = document.getElementsByTagName("script"),
            i = scripts.length - 1;

        for(; 0 <= i; i--) scripts[i].parentNode.removeChild(scripts[i]);

    });

    // Extract HTML source
    html = page.evaluate(function() {

        return document.documentElement.outerHTML;

    });

    // Collect rawString
    rawString = page.evaluate(function() {

        var rawString = "",
        
            ignore = {

                "script": true,
                "noscript": true,
                "style": true,
                "iframe": true

            };

        (function(node){

            var i = 0,
                name = node.nodeName.toLowerCase(),
                content,
                func = arguments.callee;

            if(node.childNodes.length <= 0) {

                if(name === "#text") {

                    content = node.textContent.replace(/\s+/g, " ").replace(/^ | $/g, "");
                    if(content !== "") rawString += " " + content;

                } else if(name === "img") {

                    rawString += " <IMG:" +
                        encodeURIComponent(node.getAttribute("src") || "no-src") + ">";

                }

            } else if(!ignore[name]){

                for(; i < node.childNodes.length; i++) func(node.childNodes[i]);

            }

        })(document.body);

        return rawString;

    });

    // Output
    system.stdout.write(rawString + "\t" + html);
    phantom.exit(0);

});
