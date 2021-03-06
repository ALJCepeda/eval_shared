var Agent = require('./../scripts/pg/agent');
var Project = require('./../scripts/project');

var Promise = require('bluebird');
var tape = require('tape');
var url = process.env.PSQL_EVAL;

var agent = new Agent(url);
var xtape = function(name) {
	console.log('Test (' + name + ') manually avoided');
};

tape('execute', function(t) {
    agent.execute().then(function(executeInfo) {
        t.deepEqual(
            executeInfo,
            {   php: {  latest: {   platform: 'php',
                                    tag: 'latest',
                                    compile: null,
                                    run: 'php index.php' }
                },
                nodejs: {   latest: {   platform: 'nodejs',
                                        tag: 'latest',
                                        compile: null,
                                        run: 'node index.js' }
                },
                haskell: {  latest: {   platform: 'haskell',
                                        tag: 'latest',
                                        compile: 'ghc -o app index.hs',
                                        run: './app'    }
                },
                pascal: {   latest: {   platform: 'pascal',
                                        tag: 'latest',
                                        compile: 'fpc index.pas',
                                        run: './index'  }
                }
        }, 'Selected execute info' );
    }).catch(t.fail).done(t.end);
});

tape('platform', function(t) {
    agent.platform().then(function(platformInfo) {
        t.deepEqual(
            platformInfo,
            {   php: {  name: 'PHP',
                        aceMode: 'php',
                        extension: 'php',
                        tags: [ 'latest', '5.5', '5.4', '5.6' ],
                        demo: {
							index: {
								id:'index',
								extension:'php',
								content:'<?php\n\techo "Hello World!";'
							}
						}
                },
                nodejs: {   name: 'NodeJS',
                            aceMode: 'javascript',
                            extension: 'js',
                            tags: [ 'latest', '0.12.7' ],
                            demo: {
								index: {
									id:'index',
									extension:'js',
									content:'console.log("Hello World!");'
								}
							}
                },
                haskell: {  name: 'Haskell',
                            aceMode: 'haskell',
                            extension: 'hs',
                            tags: [ 'latest' ],
                            demo: {
								index: {
									id:'index',
									extension:'hs',
									content:'main = putStrLn "Hello World!";'
								}
							}
                },
                pascal: {   name: 'Pascal',
                            aceMode: 'pascal',
                            extension: 'pas',
                            tags: [ 'latest' ],
                            demo: {
								index: {
									id:'index',
									extension:'pas',
									content:'program Hello;\nbegin\n\twriteln ("Hello World!");\nend.'
								}
							}
                }
        }, 'Selected platform info');
    }).catch(t.fail).done(t.end);
});

tape('projectSelect', function(t) {
    agent.projectSelect('phptest').then(function(project) {
        t.deepEqual(
            project,
            {   id: 'phptest',
                platform: 'php',
                tag: 'latest',
				save: {
					id: 'test1',
					root: 'test1',
					parent: '',
					stdout: 'This is php test1',
					stderr: ''
				},
                documents:{
                   index: {	id: 'index',
                        	extension: 'php',
                        	content: '<?php echo "This is php test1";' }
                }
            }, 'Selected Project \'phptest\''
        );
    }).catch(t.fail).done(t.end);
});

tape('projectSaveSelect', function(t) {
    agent.projectSaveSelect('phptest', 'test2').then(function(project) {
        t.deepEqual(
			project,
			{ 	id: 'phptest',
  				platform: 'php',
  				tag: 'latest',
				save: {
					id: 'test2',
					root: 'test1',
					parent: 'test1',
					stdout: 'This is php test2',
					stderr: ''
				},
  				documents: {
					index: { 	id: 'index',
       							extension: 'php',
       							content: '<?php echo "This is php test2";' }
				}
		}, 'Selected save \'test2\' of project \'phptest\'');
    }).catch(t.fail).done(t.end);
});

tape('projectSaveSelect - not found', function(t) {
	agent.projectSaveSelect('phptest', 'testnone').then(function(project) {
		t.false(project, 'SaveID not found, project is false');
	}).catch(t.fail).done(t.end);
});

tape('generateProjectID', function(t) {
	agent.generateProjectID(8, 'phptest').then(function(id) {
		t.ok(id, 'Project ID was generated');
	}).catch(t.fail).done(t.end);
});

tape('generateSaveID', function(t) {
	agent.generateSaveID('phptest', 8).then(function(id) {
		t.ok(id, 'Save ID was generated');
	}).catch(t.fail).done(t.end);
});

var phpProject = new Project({
	id:'phpize',
	platform:'php',
	tag:'5.6',
	save: {
		id: 'izesave',
		root: 'izesave',
		parent: null,
		stdout: '',
		stderr: ''
	},
	documents: {
		index: {
			id:'index',
			extension:'php',
			content:'Does it really matter?'
		}
	}
});

tape('projectInsert', function(t) {
	agent.projectInsert(phpProject).then(function(count) {
		t.equal(count, 1, 'Inserted Project \'phpize\'');
	}).catch(t.fail).done(t.end);
});

var save1Project = new Project({
	id:'phpize',
	platform:'php',
	tag:'5.6',
	save: {
		id: 'save1',
		root: 'izesave',
		parent: 'izesave',
		stdout: '',
		stderr: ''
	},
	documents: {
		index: {
			id:'index',
			extension:'php',
			content:'This is a save for phpize'
		}
	}
});

var save2Project = new Project({
	id:'phpize',
	platform:'php',
	tag:'5.6',
	save: {
		id: 'save2',
		root: 'izesave',
		parent: 'save1',
		stdout: '',
		stderr: ''
	},
	documents: {
		index: {
			id:'index',
			extension:'php',
			content:'Yet another save for phpize'
		}
	}
});

tape('save1Insert', function(t) {
	agent.saveInsert(save1Project).then(function(count) {
		t.equal(count, 1, 'Inserted save \'save1\' for Project \'phpize\'');
	}).catch(t.fail).done(t.end);
});

tape('save2Insert', function(t) {
	agent.saveInsert(save2Project).then(function(count) {
		t.equal(count, 1, 'Inserted save \'save2\' for Project \'phpize\'');
	}).catch(t.fail).done(t.end);
});

tape('projectDelete', function(t) {
	agent.projectDelete(phpProject).then(function(count) {
		t.equal(count, 1, 'Deleted Project \'phpize\'');
		t.end();
	}).catch(t.fail);
});
