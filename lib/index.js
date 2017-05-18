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
            let body;
            try { 
                body = JSON.parse(this.currItem.response.body);
            } catch (e) { 
                body = this.currItem.response.body;
            }
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
                this.writeGreen('Name: ');
                console.log(this.failures[i].item.name);
                this.writeGreen('Url: ');
                console.log(this.failures[i].item.url);
                this.writeGreen('Response code: ');
                console.log(this.failures[i].details);
                this.writeGreen('Failed assertions: ');
                console.log(this.failures[i].msg);
                this.writeGreen('Response body:\n');
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



