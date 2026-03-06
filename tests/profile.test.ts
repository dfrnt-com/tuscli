import * as assert from 'assert';
import { runCli } from './helpers';

describe('Profile operations', function () {
  this.timeout(10000);

  it('should dump the connection profile', function () {
    const result = runCli('--dump-profile');
    assert.strictEqual(result.exitCode, 0, 'dump-profile failed, stderr: ' + result.stderr);
    // The JSON profile is output via console.log (stdout), debug info via console.warn (stderr)
    assert.ok(result.stdout.includes('url') && result.stdout.includes('organisation'),
      'Profile output should contain connection fields');
  });

  it('should hide sensitive keys in the profile dump', function () {
    const result = runCli('--dump-profile');
    assert.strictEqual(result.exitCode, 0);
    assert.ok(result.stdout.includes('hidden'), 'Key value should be masked as hidden in profile output');
    assert.ok(!result.stdout.includes('"root"'), 'Raw key value should not appear in profile output');
  });
});
