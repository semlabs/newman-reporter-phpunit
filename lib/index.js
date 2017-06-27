'use strict';

class PhpUnitStyleReporter {
    constructor(emitter, reporterOptions, options) {
        this.failures = new Array();
        this.errors = new Array();
        this.reporterOptions = reporterOptions;
        this.options = options;
        const events = 'start beforeIteration iteration beforeItem item beforePrerequest prerequest beforeScript script beforeRequest request beforeTest test beforeAssertion assertion console exception beforeDone done'.split(' ');
        events.forEach((e) => { if (typeof this[e] == 'function') emitter.on(e, (err, args) => this[e](err, args)) });
    }

    start(err, args) {
        console.log(`Starting postman collection '${this.options.collection.name}'`);
        console.log('');
    }

    beforeItem(err, args) {
        this.currItem = {name: args.item.name, passed: true, failedAssertions: []};
    }

    beforeRequest(err, args) {
        this.currItem.method = args.request.method;
        this.currItem.url = args.request.url.toString();
    }

    request(err, args) {
        if (err) {
            this.currItem.error = true;
            this.writeRed('E');
            let error = new Object();
            error.msg = err.code;
            this.errors.push(error);
        } else {
            this.currItem.response = args.response;
        }
    }

    assertion(err, args) {
        if (err) {
            this.currItem.passed = false;
            this.currItem.failedAssertions.push(args.assertion);
        }
    }

    item(err, args) {
        if(this.currItem.error) {
            return;
        }

        if (!this.currItem.passed) {
            this.writeRed('F');
            const msg = this.currItem.failedAssertions.join(", ");
            const details = `${this.currItem.response.code}, reason: ${this.currItem.response.reason()}`;
            let body = this.currItem.response.stream.toString(); // response.stream is a buffer
            try {
                body = JSON.parse(body);
            } catch (e) {}

            let failure = new Object();
            failure.item = this.currItem;
            failure.msg = msg;
            failure.details = details;
            failure.body = body;
            this.failures.push(failure);
        } else {
            process.stdout.write('.');
        }
    }

    done(err, args) {
        console.log('');
        console.log('');
        console.log(`Collection '${this.options.collection.name}' finished`);
        console.log('');
        if(this.errors.length > 0) {
            this.writeRed(this.errors.length + ' errors:\n\n');
            for(var i = 0; i < this.errors.length; i++) {
                this.writeGreen('Error: ');
                console.log(this.errors[i].msg);
                console.log('');
            }
        }
        if(this.failures.length > 0) {
            this.writeRed(this.failures.length + ' failures:\n\n');
            for(var i = 0; i < this.failures.length; i++) {
                this.writeRed('Name: ');
                console.log(this.failures[i].item.name);
                this.writeRed('Url: ');
                console.log(this.failures[i].item.url);
                this.writeRed('Response code: ');
                console.log(this.failures[i].details);
                this.writeRed('Failed assertions: ');
                console.log(this.failures[i].msg);
                this.writeRed('Response body:\n');
                console.log(this.failures[i].body);
                console.log('');
            }
        }
    }

    writeRed(text) {
        process.stdout.write('\x1B[31m' + text + '\x1B[39m')
    }

    writeGreen(text) {
        process.stdout.write('\x1B[32m' + text + '\x1B[39m')
    }
}

module.exports = PhpUnitStyleReporter;
