var async = require('async');
var helpers = require('../../helpers');

module.exports = {
	title: 'CloudTrail Encryption',
	category: 'CloudTrail',
	description: 'Ensures CloudTrail encryption at rest is enabled for logs',
	more_info: 'CloudTrail log files contain sensitive information about an account and should be encrypted at risk for additional protection.',
	recommended_action: 'Enable CloudTrail log encryption through the CloudTrail console or API',
	link: 'http://docs.aws.amazon.com/awscloudtrail/latest/userguide/encrypting-cloudtrail-log-files-with-aws-kms.html',
	apis: ['CloudTrail:describeTrails'],

	run: function(cache, includeSource, callback) {
		var results = [];
		var source = {};

		async.each(helpers.regions.cloudtrail, function(region, cb){
			var describeTrails = (cache.cloudtrail &&
								  cache.cloudtrail.describeTrails &&
								  cache.cloudtrail.describeTrails[region]) ?
								  cache.cloudtrail.describeTrails[region] : null;

			if (!describeTrails) return cb();

			if (describeTrails.err || !describeTrails.data) {
				helpers.addResult(results, 3, 'Unable to query for CloudTrail encryption status', region);
				return rcb();
			}

			if (!describeTrails.data.length) {
				helpers.addResult(results, 2, 'CloudTrail is not enabled', region);
			} else if (describeTrails.data[0]) {
				for (t in describeTrails.data) {
					if (!describeTrails.data[t].KmsKeyId) {
						helpers.addResult(results, 2, 'CloudTrail encryption is not enabled',
							region, describeTrails.data[t].TrailARN)
					} else {
						helpers.addResult(results, 0, 'CloudTrail encryption is enabled',
							region, describeTrails.data[t].TrailARN)
					}
				}
			} else {
				helpers.addResult(results, 2, 'CloudTrail is enabled but is not properly configured', region);
			}
			cb();
		}, function(){
			if (includeSource) {
				source = {
					describeTrails: (cache.cloudtrail && cache.cloudtrail.describeTrails) ?
									 cache.cloudtrail.describeTrails : null
				}
			}

			callback(null, results, source);
		});
	}
};